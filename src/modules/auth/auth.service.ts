import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { hashData, compareHash } from '../../utils/hash';
import { redisClient } from '../../config/redis';
import { User } from './auth.model';
import { logger } from '../../config/logger';
import { generateAccessToken, generateRefreshToken, generateRefreshTokenWithId } from '../../utils/token';
import { IUser } from '../../models/user.model';

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const registerUser = async (data: RegisterInput): Promise<IUser> => {
  try {
    /**
     * ✅ 1. Hash password
     */
    const hashed = await hashData(data.password);

    /**
     * ✅ 2. Create user
     */
    const user = await User.create({
      ...data,
      password: hashed,
    });

    /**
     * 🔐 3. Sanitize before returning
     */
    const userObj = user.toObject();
    const safeUser = { ...userObj, password: '' };

    /**
     * ✅ 4. Logging (safe)
     */
    logger.info('User created', {
      userId: user._id,
      email: user.email,
    });

    return safeUser;
  } catch (err: any) {
    /**
     * ❗ Duplicate email
     */
    if (err.code === 11000) {
      const error: any = new Error('Email already exists');
      error.status = 409;
      throw error;
    }

    logger.error('Register failed', {
      error: err.message,
      email: data.email,
    });

    throw err;
  }
};

// export const loginUser = async (email: string, password: string) => {
//   try {
//     /**
//      * ✅ 1. Get user (include password explicitly)
//      */
//     const user = await User.findOne({ email }).select('+password').lean();

//     if (!user) {
//       const err: any = new Error('User not found');
//       err.status = 404;
//       throw err;
//     }

//     const { token: refreshToken, jti } = generateRefreshTokenWithId({ id: user._id });
//     const accessToken = generateAccessToken({ id: user._id });
//     // const refreshToken = generateRefreshToken({ id: user._id });
//     /**
//      * ✅ 2. Compare password
//      */
//     const match = await compareHash(password, user.password);

//     if (!match) {
//       const err: any = new Error('Invalid credentials');
//       err.status = 401;
//       throw err;
//     }

//     /**
//      * 🔐 3. Generate token
//      */

//     /**
//      * 🔐 4. Remove password BEFORE caching
//      */
//     const safeUser = { ...user, password: '' };

//     /**
//      * ✅ 5. Cache safe user
//      */
//     await redisClient.set(`user:${user._id}`, JSON.stringify(safeUser), {
//       EX: 3600,
//     });

//     /**
//      * ✅ 6. Logging
//      */
//     logger.info('User login success', {
//       userId: user._id,
//       email,
//     });

//     return { user, refreshToken,accessToken };
//   } catch (err: any) {
//     logger.error('Login failed', {
//       email,
//       error: err.message,
//     });

//     throw err;
//   }
// };

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) throw new Error('User not found');

    const match = await compareHash(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const accessToken = generateAccessToken({ id: user._id });

    const { token: refreshToken, jti } = generateRefreshTokenWithId({ id: user._id });

    // ✅ Store per-device session
    await redisClient.set(`refresh:${user._id}:${jti}`, refreshToken, { EX: 7 * 24 * 3600 });

    const safeUser = { ...user, password: '' };

    await redisClient.set(`user:${user._id}`, JSON.stringify(safeUser), { EX: 3600 });

    logger.info('User login success', {
      userId: user._id,
      jti,
    });

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    logger.error('Login failed', { email, error: err.message });
    throw err;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

    const { id, jti } = decoded;

    const stored = await redisClient.get(`refresh:${id}:${jti}`);

    if (!stored) throw new Error('Invalid refresh token');

    // 🔥 Rotation
    await redisClient.del(`refresh:${id}:${jti}`);

    const newAccessToken = generateAccessToken({ id });

    const { token: newRefreshToken, jti: newJti } = generateRefreshTokenWithId({ id });

    await redisClient.set(`refresh:${id}:${newJti}`, newRefreshToken, { EX: 7 * 24 * 3600 });

    logger.info('Token refreshed', { userId: id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err: any) {
    logger.error('Refresh token failed', { error: err.message });
    throw err;
  }
};

export const logoutAllDevices = async (userId: string) => {
  const iterator = redisClient.scanIterator({
    MATCH: `refresh:${userId}:*`,
  });

  const keys: string[] = [];

  for await (const key of iterator) {
    keys.push(key);
  }

  if (keys.length) {
    await redisClient.del(keys);
  }

  logger.info('User logged out from all devices', {
    userId,
    sessionsRemoved: keys.length,
  });
};
