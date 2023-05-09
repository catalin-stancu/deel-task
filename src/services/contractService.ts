import { Op } from 'sequelize';
import { Service } from 'typedi';
import { CONTRACT_STATUS } from '../enums/enums';
import { MissingDataError } from '../errors';
import { Contract } from '../models/contract.model';
import { Job } from '../models/job.model';
import { Profile } from '../models/profile.model';

type UserContracts = Pick<Contract, 'id' | 'status' | 'terms'>

@Service()
export default class ContractService {

  async getAllForUser(profileId: number): Promise<UserContracts[]> {
    return Contract.findAll({
      where: {
        status: {
          [Op.ne]: CONTRACT_STATUS.TERMINATED
        },
        [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
      },
      attributes: ['id', 'status', 'terms'],
      raw: true
    });
  }

  async getOneForUser(contractId: number, profileId: number): Promise<Contract> {
    const contract = await Contract.findOne({
      where: {
        id: contractId,
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
        {
          model: Job,
          attributes: ['id', 'description', 'price', 'paid', 'paymentDate']
        }
      ]
    });

    if (!contract) {
      // Usually it's a better security practice to not give very specific errors
      // In this case I'm not retrieving the contract and then checking if the user making the request
      // Is either the Client or the Contractor and returning a 403 if it's not
      // Rather I'm just returning 404 Not Found to be more vague
      throw new MissingDataError(`Contract with id ${contractId} not found!`);
    }

    return contract;
  }
}
