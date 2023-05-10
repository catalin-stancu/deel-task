import { Op } from 'sequelize';
import { Service } from 'typedi';
import { ConflictError, MissingDataError, ValidationError } from '../errors';
import { Contract } from '../models/contract.model';
import { Job } from '../models/job.model';
import { Profile } from '../models/profile.model';
import { sequelize } from '../server';
import Decimal from 'decimal.js-light';

type DepositReq = {
  amount: number
  version: number
}

@Service()
export default class BalanceService {

  async depositMoney({ amount, version }: DepositReq, userId: number, profileId: number) {
    return sequelize.transaction(async transaction => {
      const profileToUpdate = await Profile.findOne({
        where: { id: userId },
        attributes: ['id', 'balance', 'version'],
        transaction,
        lock: transaction.LOCK.UPDATE
        // We are using optimistic concurrency, meaning transactions are allowed to proceed independently
        // until they attempt to modify the same data, at which point a conflict resolution mechanism is used
        // to resolve the conflict and we'll get back an OptimisticLockError
        // We should use this kind of mechanism to prevent concurrent update of resources
        // To ensure data integrity and corectness
      });

      if (!profileToUpdate) {
        throw new MissingDataError('Profile not found!');
      }

      if (profileToUpdate.version !== version) {
        throw new ConflictError('The resource you are trying to change has been updated in the meantime');
      }

      const unpaidJobs = await Job.findAll({
        where: { paid: null },
        include: [
          {
            model: Contract,
            attributes: ['id'],
            where: {
              [Op.or]: [{ ClientId: profileId }]
            }
          }
        ],
        transaction,
        attributes: ['id', 'price'],
        raw: true
      });

      const totalAmountToPay = unpaidJobs.reduce((sum: Decimal, job: Job) => {
        return sum.add(job.price);
      }, new Decimal(0));

      const maximumAmountAllowed = totalAmountToPay.times(0.25);
      const amountToPay = new Decimal(amount);

      if (amountToPay.sub(maximumAmountAllowed).isPositive()) {
        throw new ValidationError('You are allowed to deposit a maximum of 25% of your total jobs to pay');
      }

      const newBalance = amountToPay.add(profileToUpdate.balance).toFixed(2);

      return profileToUpdate.update({
        balance: newBalance,
        version: profileToUpdate.version + 1
      }, { transaction });
    });
  }
}
