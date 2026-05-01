import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../modules/auth/auth.types';
import { AppError } from '../utils/app-error';

export const authorize = (...roles: Array<UserRole | string>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as { role?: string } | undefined;
    if (!user || !user.role) {
      throw new AppError('Unauthorized', 401);
    }

    if (!roles.includes(user.role)) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }

    next();
  };
};
