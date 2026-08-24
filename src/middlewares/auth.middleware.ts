import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/jwt';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../config/logger';

// export const protect = (req: any, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token' });

//   try {
//     req.user = verifyToken(token);
//     next();
//   } catch {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

export const protect = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn('No token provided', { ip: req.ip });
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (err: any) {
    logger.error('Invalid access token', {
      error: err.message,
      ip: req.ip,
    });

    return res.status(401).json({ message: 'Invalid token' });
  }
};