import { NextFunction, Request, Response } from 'express';
import {
    ConflictError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    MissingDataError
} from '../errors'

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
    } else if (err instanceof ConflictError) {
        status = 409;
    }

    return res.status(status).send(formatter(err.message ?? 'Internal Server Error'));
};
