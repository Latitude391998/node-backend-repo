import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { registerUser, loginUser, logoutAllDevices } from './auth.service';
import { registerSchema } from '../../utils/validator';
import { logger } from '../../config/logger';
import { refreshAccessToken } from './auth.service';
import { redisClient } from '../../config/redis';
import { User } from './auth.model';
const ENV = process.env.NODE_ENV;

const getCookieOptions = () => ({
  httpOnly: true,
  secure: ENV === 'production', // False on http://localhost, True on HTTPS
  sameSite: (ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);

    if (error) return res.status(400).json({ message: 'Validation failed', details: error.details.map((d) => d.message) });

    const user = await registerUser(value);

    logger.info('User registered', { email: user.email, userId: user._id, ip: req.ip });

    return res.status(201).json({ message: 'User registered successfully', data: { id: user._id, email: user.email } });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const data = await loginUser(email, password);

    logger.info('User login', { email, userId: data.user?._id, ip: req.ip });
    const refreshToken = data.refreshToken;

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    return res.status(200).json({ message: 'Login successful', user: data.user, accessToken: data.accessToken });
  } catch (err: any) {
    if (err.message === 'Invalid credentials' || err.message === 'User not found')
      return res.status(401).json({ message: 'Invalid email or password' });
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const tokens = await refreshAccessToken(refreshToken);

    // Fetch user from Redis or DB so the frontend receives the required UserProfile contract
    const decoded: any = jwt.verify(tokens.accessToken, process.env.ACCESS_TOKEN_SECRET!);
    const cachedUser = await redisClient.get(`user:${decoded.id}`);
    let user = cachedUser ? JSON.parse(cachedUser) : null;

    if (!user) {
      const dbUser = await User.findById(decoded.id).lean();
      if (!dbUser) return res.status(401).json({ message: 'User not found' });
      user = { ...dbUser, password: '' };
      await redisClient.set(`user:${decoded.id}`, JSON.stringify(user), { EX: 3600 });
    }
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    return res.status(200).json({ message: 'Token refreshed', accessToken: tokens.accessToken, user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'User Id required to logout' });

    const data = await logoutAllDevices(userId);
    logger.info('User logout', { userId: userId, ip: req.ip });
    res.clearCookie('refreshToken', getCookieOptions());
    return res.status(200).json({ message: 'Logout successful.' });
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid user Id' });
    next(err);
  }
};