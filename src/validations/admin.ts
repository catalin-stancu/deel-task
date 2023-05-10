import { query } from 'express-validator';
import { ValidationError } from '../errors';

export const startEndCompare = (start: string, end: string) => {
  const startDate = new Date(start).setUTCHours(0, 0, 0, 0);
  const endDate = new Date(end).setUTCHours(23, 59, 59, 999);

  if (endDate <= startDate) {
    throw new ValidationError('Start date should be before end date');
  }

  return true;
};

const startDateSchema = query('start', 'Start date should be a valid date [YYYY-MM-DD]')
  .isDate({ format: 'YYYY-MM-DD', delimiters: ['-'] })
  .custom((endDate, { req }) => startEndCompare(req.body.startDate, endDate));

const endDateSchema = query('end', 'End date should be a valid date [YYYY-MM-DD]')
  .isDate({ format: 'YYYY-MM-DD', delimiters: ['-'] })
  .custom((startDate, { req }) => startEndCompare(startDate, req.body.endDate));

export const bestProfessionSchema = [startDateSchema, endDateSchema];
