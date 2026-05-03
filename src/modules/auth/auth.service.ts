import { hashData, compareHash } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { redisClient } from '../../config/redis';
import { User } from './auth.model';
import { logger } from '../../config/logger';

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export const registerUser = async (data: RegisterInput) => {
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

export const loginUser = async (email: string, password: string) => {
  try {
    /**
     * ✅ 1. Get user (include password explicitly)
     */
    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    /**
     * ✅ 2. Compare password
     */
    const match = await compareHash(password, user.password);

    if (!match) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    /**
     * 🔐 3. Generate token
     */
    const token = generateToken({ id: user._id });

    /**
     * 🔐 4. Remove password BEFORE caching
     */
    const safeUser = { ...user, password: '' };

    /**
     * ✅ 5. Cache safe user
     */
    await redisClient.set(`user:${user._id}`, JSON.stringify(safeUser), {
      EX: 3600,
    });

    /**
     * ✅ 6. Logging
     */
    logger.info('User login success', {
      userId: user._id,
      email,
    });

    return { user, token };
  } catch (err: any) {
    logger.error('Login failed', {
      email,
      error: err.message,
    });

    throw err;
  }
};
