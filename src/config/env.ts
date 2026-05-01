import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: Number(getEnv('PORT', '4000')),
  MONGO_URI: getEnv('MONGO_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1d'),
  REDIS_URL: getEnv('REDIS_URL'),
  TOKEN_BLACKLIST_TTL: Number(getEnv('TOKEN_BLACKLIST_TTL', '86400')),
  SMTP_HOST: getEnv('SMTP_HOST'),
  SMTP_PORT: Number(getEnv('SMTP_PORT', '587')),
  SMTP_USER: getEnv('SMTP_USER'),
  SMTP_PASS: getEnv('SMTP_PASS'),
  EMAIL_FROM: getEnv('EMAIL_FROM'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL'),
};
