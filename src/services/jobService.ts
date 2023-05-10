import Decimal from 'decimal.js-light';
import { Op, QueryTypes } from 'sequelize';
import { Service } from 'typedi';

import { CONTRACT_STATUS } from '../enums/enums';
import { ConflictError, MissingDataError, ValidationError } from '../errors';
import { Contract } from '../models/contract.model';
import { Job } from '../models/job.model';
import { Profile } from '../models/profile.model';
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

interface AggProfile extends Profile {
  total: number
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
            }
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
              }
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

  async getBestProfession(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const profiles = await Profile.findAll({
      attributes: [
        'profession',
        [sequelize.literal('SUM("contractorContracts->Jobs".price)'), 'total']
      ],
      include: [
        {
          model: Contract,
          as: 'contractorContracts',
          attributes: [],
          required: true,
          include: [
            {
              model: Job,
              where: {
                paid: true,
                paymentDate: {
                  [Op.gte]: startDate,
                  [Op.lte]: endDate
                }
              },
              required: true,
              attributes: []
            }
          ]
        }
      ],
      group: ['Profile.id', 'Profile.profession'],
      order: [['total', 'DESC']]
    });

    if (!profiles.length) {
      throw new MissingDataError('No best professions found in this time range!');
    }

    // At this point we've obtained the sum of paid jobs for each contractor
    // And we need to see which profession was the best paid

    const bestProfessions: {[key: string]: Decimal} = profiles.reduce((map, profile) => {
      const { profession, total } = profile.toJSON() as AggProfile;

      if (!map[profession]) {
        map[profession] = new Decimal(total);
      } else {
        map[profession] = map[profession].add(total);
      }
      return map;
    }, {});

    const sortedProfessions = Object.entries(bestProfessions).sort((a, b) => {
      const [, firstValue] = a;
      const [, secondValue] = b;

      return secondValue.sub(firstValue).toNumber();
    });

    const [profession, total] = sortedProfessions[0];
    return {
      profession,
      total: total.toFixed(2)
    };
  }

  async getBestProfessionWithRawQuery(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const bestProfessions = await sequelize.query(
      `SELECT profession, SUM(total) as total FROM (
          SELECT p.id, p.profession, SUM(j.price) AS total
          FROM "Profiles" AS p
          INNER JOIN "Contracts" AS c ON p.id = c."ContractorId"
          INNER JOIN "Jobs" AS j ON c.id = j."ContractId"
          AND j.paid = true
          AND j."paymentDate" >= :startDate
          AND j."paymentDate" <= :endDate
          GROUP BY p.id ) as temp
        GROUP BY profession
        ORDER BY total DESC 
        LIMIT 1`, {
        replacements: {
          startDate,
          endDate
        },
        type: QueryTypes.SELECT
      });

    if (!bestProfessions.length) {
      throw new MissingDataError('No best professions found in this time range!');
    }

    return bestProfessions[0];
  }
}
