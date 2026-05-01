export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ConfirmEmailPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface GoogleTokenPayload {
  idToken: string;
}

export interface GoogleAuthUser {
  id: string;
  email: string;
  role: UserRole;
}
