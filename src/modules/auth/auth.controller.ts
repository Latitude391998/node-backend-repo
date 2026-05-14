import { NextFunction, Request, Response } from 'express';
import { registerUser, loginUser, logoutAllDevices } from './auth.service';
import { registerSchema } from '../../utils/validator';
import { logger } from '../../config/logger';
import { refreshAccessToken } from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * ✅ 1. Validate Request
     */
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    /**
     * ✅ 2. Call Service Layer
     */
    const user = await registerUser(value);

    /**
     * ✅ 3. Business Logging (SAFE)
     */
    logger.info('User registered', {
      email: user.email,
      userId: user._id,
      ip: req.ip,
    });

    /**
     * ✅ 4. Response
     */
    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err: any) {
    /**
     * ❗ 5. Known Errors (Example: duplicate email)
     */
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }

    /**
     * ❗ 6. Unknown Errors → pass to global handler
     */
    next(err);
  }
};

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const data = await loginUser(email, password);
//   res.json(data);
// };

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const data = await loginUser(email, password);

    /**
     * ✅ Logging (no password!)
     */
    logger.info('User login', {
      email,
      userId: data.user?._id,
      ip: req.ip,
    });
    const refreshToken = data.refreshToken;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // ⚠️ true in production (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      message: 'Login successful',
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (err: any) {
    /**
     * ❗ Known auth errors
     */
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    next(err);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    // const { refreshToken } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const tokens = await refreshAccessToken(refreshToken);
    const responseRefreshToken = tokens.refreshToken;
    res.cookie('refreshToken', responseRefreshToken, {
      httpOnly: true,
      secure: false, // ⚠️ true in production (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      message: 'Token refreshed',
      accessToken: tokens.accessToken,
    });
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired refresh token',
    });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User Id required to logout',
      });
    }

    const data = await logoutAllDevices(userId);

    /**
     * ✅ Logout logging
     */
    logger.info('User logout', {
      userId: userId,
      ip: req.ip,
    });

    return res.status(200).json({
      message: 'Logout successful.',
    });
  } catch (err: any) {
    /**
     * ❗ Known auth errors
     */
    return res.status(401).json({
      message: 'Invalid user Id',
    });

    next(err);
  }
};
