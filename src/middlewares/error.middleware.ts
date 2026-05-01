import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    status: 'error',
    message,
  });
};
