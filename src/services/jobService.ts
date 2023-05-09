import { Op } from 'sequelize';
import { Service } from 'typedi';
import Decimal, { Numeric } from 'decimal.js-light';

import { CONTRACT_STATUS } from '../enums/enums';
import { Contract } from '../models/contract.model';
import { Job } from '../models/job.model';
import { Profile } from '../models/profile.model';
import { ConflictError, MissingDataError, ValidationError } from '../errors';
import { sequelize } from '../server';

type UnpaidJob = Omit<Job, 'ContractId'>

type PaidJob = {
  job: Pick<Job, 'id' | 'price' | 'paid' | 'paymentDate'>;
  client: {
    newClientBalance: string
    oldClientBalance: string
  },
  contractor: {
    newContractorBalance: string
    oldContractorBalance: string
  }
}

@Service()
export default class ContractService {

  async getAllUnpaidForUser(profileId: number): Promise<UnpaidJob[]> {
    return Job.findAll({
      where: {
        paid: null
      },
      include: [
        {
          model: Contract,
          attributes: ['id', 'status', 'terms'],
          where: {
            status: CONTRACT_STATUS.IN_PROGRESS,
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
          },
          include: [
            {
              model: Profile,
              as: 'Client',
              attributes: ['id', 'firstName', 'lastName']
            },
            {
              model: Profile,
              as: 'Contractor',
              attributes: ['id', 'firstName', 'lastName']
            },
          ],
          required: true
        }
      ],
      attributes: { exclude: ['ContractId'] }
    });
  }

  async payJob(jobId: number, profileId: number): Promise<PaidJob> {
    // Running everything inside a transaction, because if something goes wrong
    // We don't want to end up with wrong balances for client/contractors or marking the job as done, etc
    return sequelize.transaction(async transaction => {
      const jobModel = await Job.findOne({
        where: { id: jobId },
        include: [
          {
            model: Contract,
            attributes: ['id'],
            where: {
              ClientId: profileId
            },
            include: [
              {
                model: Profile,
                as: 'Client',
                attributes: ['id', 'balance']
              },
              {
                model: Profile,
                as: 'Contractor',
                attributes: ['id', 'balance']
              },
            ],
            required: true
          }
        ],
        transaction
      });

      if (!jobModel) {
        throw new MissingDataError(`Job with id ${jobId} not found!`);
      }

      if (jobModel.paid) {
        throw new ConflictError('This job was already paid!');
      }

      const job = jobModel.toJSON() as Job;
      const { Client, Contractor } = job.Contract;

      // Databases usually return decimals as a string to preserve precision
      const clientBalance = new Decimal(Client.balance);
      const contractorBalance = new Decimal(Contractor.balance);
      const jobPrice = new Decimal(job.price);

      if (clientBalance.sub(jobPrice).isNegative()) {
        throw new ValidationError('Your balance is lower than the price of the job');
      }

      // Usually when we are dealing with price computations, we need to be EXTRA careful
      // because of floating point number precision problems
      // We can use a library that help us not to lose precision like bigNumber.js or decimal.js
      const newContractorBalance = contractorBalance.add(jobPrice).toFixed(2);
      const newClientBalance = clientBalance.sub(jobPrice).toFixed(2);

      await Profile.update({ balance: newContractorBalance }, { where: { id: Contractor.id }, transaction });
      await Profile.update({ balance: newClientBalance }, { where: { id: Client.id }, transaction });
      const updatedJob = await jobModel.update({ paid: true, paymentDate: new Date() }, { transaction });

      // Returning this info for the sake of checking the corectness of the action
      return {
        job: {
          id: job.id,
          paid: updatedJob.paid,
          paymentDate: updatedJob.paymentDate,
          price: job.price
        },
        client: {
          newClientBalance,
          oldClientBalance: Client.balance
        },
        contractor: {
          newContractorBalance,
          oldContractorBalance: Contractor.balance
        }
      };
    });
  }
}
