import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const protect = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
