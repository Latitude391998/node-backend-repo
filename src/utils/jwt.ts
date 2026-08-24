// import jwt from 'jsonwebtoken';

// export const generateToken = (payload: any) => {
//   return jwt.sign(payload, process.env.JWT_SECRET!, {
//     expiresIn: '15m',
//   });
// };

// export const verifyToken = (token: string) => {
//   return jwt.verify(token, process.env.JWT_SECRET!);
// };
import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
};