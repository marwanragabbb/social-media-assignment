import UserModel, { IUser } from '../../models/user.model';
import { env } from '../../config/env';
import { redisClient } from '../../config/redis';
import { emailService } from '../../services/email.service';
import { jwtService } from '../../services/jwt.service';
import { passwordService } from '../../services/password.service';
import { generateOtp, buildOtpKey, buildBlacklistKey } from '../../utils/otp.util';
import { OAuth2Client } from 'google-auth-library';
import {
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  GoogleTokenPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
  UpdatePasswordPayload,
} from './auth.types';
import { AppError } from '../../utils/app-error';

const OTP_TTL_SECONDS = 300;

class AuthService {
  async signup(payload: SignUpPayload): Promise<{ user: IUser; otp: string }> {
    const existingUser = await UserModel.findOne({ email: payload.email }).exec();
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await passwordService.hashPassword(payload.password);
    const user = await UserModel.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });

    const otp = generateOtp();
    const otpKey = buildOtpKey(payload.email);
    await redisClient.setEx(otpKey, OTP_TTL_SECONDS, otp);

    await emailService.sendMail({
      to: user.email,
      subject: 'Confirm your email',
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    return { user, otp };
  }

  async confirmEmail(payload: ConfirmEmailPayload): Promise<void> {
    const otpKey = buildOtpKey(payload.email);
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== payload.otp) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const user = await UserModel.findOneAndUpdate(
      { email: payload.email },
      { isVerified: true },
      { new: true }
    ).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await redisClient.del(otpKey);
  }

  async login(payload: LoginPayload): Promise<string> {
    const user = await UserModel.findOne({ email: payload.email }).exec();
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await passwordService.comparePassword(payload.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Email is not verified', 403);
    }

    return jwtService.sign({ userId: user.id, email: user.email, role: user.role });
  }

  async googleLoginWithIdToken(payload: GoogleTokenPayload): Promise<string> {
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    let ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken: payload.idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      throw new AppError('Invalid Google ID token', 401);
    }

    const googlePayload = ticket.getPayload();
    const email = googlePayload?.email;
    const googleId = googlePayload?.sub;
    const name = googlePayload?.name || googlePayload?.email?.split('@')[0] || 'Google User';

    if (!email || !googleId) {
      throw new AppError('Google token did not provide required user information', 400);
    }

    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser) {
      existingUser.googleId = googleId;
      existingUser.isVerified = true;
      existingUser.name = existingUser.name || name;
      await existingUser.save();

      return jwtService.sign({ userId: existingUser.id, email: existingUser.email, role: existingUser.role });
    }

    const hashedPassword = await passwordService.hashPassword(Math.random().toString(36).slice(-10));
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      googleId,
      isVerified: true,
    });

    return jwtService.sign({ userId: newUser.id, email: newUser.email, role: newUser.role });
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    const user = await UserModel.findOne({ email: payload.email }).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otp = generateOtp();
    const otpKey = buildOtpKey(payload.email);
    await redisClient.setEx(otpKey, OTP_TTL_SECONDS, otp);

    await emailService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Your password reset code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const otpKey = buildOtpKey(payload.email);
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== payload.otp) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const hashedPassword = await passwordService.hashPassword(payload.newPassword);
    const user = await UserModel.findOneAndUpdate(
      { email: payload.email },
      { password: hashedPassword },
      { new: true }
    ).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await redisClient.del(otpKey);
  }

  async updatePassword(userId: string, payload: UpdatePasswordPayload): Promise<void> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await passwordService.comparePassword(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError('Old password is incorrect', 401);
    }

    const hashedPassword = await passwordService.hashPassword(payload.newPassword);
    user.password = hashedPassword;
    await user.save();
  }

  async logout(token: string): Promise<void> {
    const blacklistKey = buildBlacklistKey(token);
    await redisClient.setEx(blacklistKey, env.TOKEN_BLACKLIST_TTL, 'blacklisted');
  }
}

export const authService = new AuthService();
