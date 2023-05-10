import { body, param, header } from 'express-validator';

export const balanceDepositSchema = [
  body('amount', 'Amount must be a valid positive number').isFloat({ min: 0.01 }),
  param('userId', 'userId must be a valid id').isInt({ min: 1 }),
  header('If-Match', 'Version match header is required').isInt()
];
