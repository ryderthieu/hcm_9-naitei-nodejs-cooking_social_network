import { randomInt } from 'crypto';
import { OTP_EXPIRATION_TIME_MS } from '../constants/otp.constant';

export const generateOtp = () => {
  const otp = randomInt(100000, 999999);
  const expireAt = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);

  return {
    otp,
    expireAt,
  };
};
