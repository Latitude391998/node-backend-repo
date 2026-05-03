import { generateToken } from '../utils/jwt';

export const slidingToken = (req: any, res: any, next: any) => {
  if (req.user) {
    const newToken = generateToken({ id: req.user.id });
    res.setHeader('x-refresh-token', newToken);
  }
  next();
};
