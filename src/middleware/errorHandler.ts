import { NextFunction, Request, Response } from 'express';
import AuthenticationError from '../errors/authenticationError';
import AuthorizationError from '../errors/authorizationError';
import MissingDataError from '../errors/missingDataError';
import ValidationError from '../errors/validationError';

export default (err: Error, _: Request, res: Response, next: NextFunction) => {
  const formatter = (message: string) => ({ message });

  if (!err) {
    return next();
  }

  let status = 500;
  if (err instanceof ValidationError) {
    status = 400;
  } else if (err instanceof AuthenticationError) {
    status = 401;
  } else if (err instanceof AuthorizationError) {
    status = 403;
  } else if (err instanceof MissingDataError) {
    status = 404;
  }

  return res.status(status).send(formatter(err.message ?? 'Internal Server Error'));
};
