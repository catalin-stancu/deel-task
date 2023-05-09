import { Service } from 'typedi';
import { Contract } from '../models/contract.model';
import { Profile } from '../models/profile.model';

@Service()
export default class ContractService {

  async getAll() {
    return Contract.findAll({
      where: {
        status: 'in_progress'
      },
      include: [
        {
          model: Profile,
          as: 'Client'
        },
        {
          model: Profile,
          as: 'Contractor'
        }
      ]
    });
  }
}
