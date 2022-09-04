import { NextFunction, Response } from 'express';
import { AppError } from '../utils/appError';

const sendError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: 'error',
    statusCode: err.statusCode,
    message: err.message,
  });
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line no-unused-vars
) => {
  /* eslint-disable no-param-reassign */
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  /* eslint-enable no-param-reassign */

  sendError(err, res);
};
