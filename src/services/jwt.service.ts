import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/jwt.payload';

class JwtService {
  sign(payload: JwtPayload): string {
    const secret: Secret = env.JWT_SECRET;
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
    return jwt.sign(payload as string | object, secret, options);
  }

  verify(token: string): JwtPayload {
    const secret: Secret = env.JWT_SECRET;
    return jwt.verify(token, secret) as JwtPayload;
  }
}

export const jwtService = new JwtService();
