import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { jwtService } from '../../services/jwt.service';
import {
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  GoogleTokenPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
  UpdatePasswordPayload,
} from './auth.types';

class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as SignUpPayload;
      const { user } = await authService.signup(payload);
      res.status(201).json({ message: 'Signup successful, OTP sent to email', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      next(error);
    }
  }

  async confirmEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ConfirmEmailPayload;
      await authService.confirmEmail(payload);
      res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as LoginPayload;
      const token = await authService.login(payload);
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async googleTokenLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as GoogleTokenPayload;
      const token = await authService.googleLoginWithIdToken(payload);
      res.status(200).json({ message: 'Google login successful', token });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ForgotPasswordPayload;
      await authService.forgotPassword(payload);
      res.status(200).json({ message: 'Password reset OTP sent to email' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ResetPasswordPayload;
      await authService.resetPassword(payload);
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as UpdatePasswordPayload;
      const user = req.user as { userId?: string } | undefined;
      if (!user || !user.userId) {
        throw new Error('Unauthorized');
      }
      await authService.updatePassword(user.userId, payload);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new Error('Authorization token is required');
      }
      await authService.logout(token);
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  async googleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Google authentication failed');
      }

      const oauthUser = req.user as { id: string; email: string; role: string };
      const token = jwtService.sign({ userId: oauthUser.id, email: oauthUser.email, role: oauthUser.role as any });
      res.status(200).json({ message: 'Google login successful', token });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
