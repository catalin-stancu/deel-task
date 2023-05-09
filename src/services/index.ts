import Container from 'typedi';
import ContractService from './contractService';
import JobService from './jobService'

export const contractService = Container.get(ContractService);
export const jobService = Container.get(JobService);
