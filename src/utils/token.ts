import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '15m', // short-lived
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d', // longer-lived
  });
};

export const generateRefreshTokenWithId = (payload: any) => {
  const jti = uuidv4();

  const token = jwt.sign({ ...payload, jti }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });

  return { token, jti };
};
