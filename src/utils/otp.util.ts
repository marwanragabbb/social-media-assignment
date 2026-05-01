export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const buildOtpKey = (email: string): string => `otp:${email}`;
export const buildBlacklistKey = (token: string): string => `blacklist:${token}`;
