import Container from 'typedi';
import ContractService from './contractService';
import JobService from './jobService';
import BalanceService from './balanceService';

export const contractService = Container.get(ContractService);
export const jobService = Container.get(JobService);
export const balanceService = Container.get(BalanceService);
