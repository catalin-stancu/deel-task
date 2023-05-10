import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ValidationChain } from 'express-validator/src/chain';
import { ValidationError } from '../errors';

export default (validations: ValidationChain[]) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    // We can run the validations in parallel for better performance
    // Running express-validator validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessage = errors
      .array({ onlyFirstError: true })
      .map(err => `${err.msg}`)
      .join('. ');
    throw new ValidationError(errorMessage);
  };
};
