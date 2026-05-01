import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../services/jwt.service';
import { redisClient } from '../config/redis';
import { AppError } from '../utils/app-error';
import { buildBlacklistKey } from '../utils/otp.util';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const blacklistKey = buildBlacklistKey(token);
    const isBlacklisted = await redisClient.get(blacklistKey);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const payload = jwtService.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
