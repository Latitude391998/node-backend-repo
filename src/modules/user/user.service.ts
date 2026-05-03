import { User } from '../auth/auth.model';
import { redisClient } from '../../config/redis';
import { logger } from '../../config/logger';

export const getProfile = async (userId: string) => {
  const cacheKey = `user:${userId}`;

  try {
    /**
     * ✅ 1. Try cache
     */
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // corrupted cache → ignore
      }
    }

    /**
     * ✅ 2. DB fallback
     */
    const user = await User.findById(userId).lean();

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    /**
     * 🔐 3. Sanitize
     */
    const safeUser = { ...user, password: '' };

    /**
     * ✅ 4. Cache it
     */
    await redisClient.set(cacheKey, JSON.stringify(user), {
      EX: 3600,
    });

    return user;
  } catch (err) {
    logger.error('Get profile failed', {
      userId,
      error: (err as any).message,
    });
    throw err;
  }
};

export const updateProfile = async (userId: string, data: Partial<{ email: string; name: string }>) => {
  try {
    /**
     * ⚠️ Prevent unsafe updates
     */
    delete (data as any).password;

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    /**
     * 🔐 Sanitize
     */
    const safeUser = { ...user, password: '' };

    /**
     * ✅ Sync cache
     */
    await redisClient.set(`user:${userId}`, JSON.stringify(safeUser), {
      EX: 3600,
    });

    logger.info('Profile updated', {
      userId,
      updatedFields: Object.keys(data),
    });

    return user;
  } catch (err) {
    logger.error('Update profile failed', {
      userId,
      error: (err as any).message,
    });
    throw err;
  }
};

export const deleteProfile = async (userId: string) => {
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    /**
     * ✅ Remove cache
     */
    await redisClient.del(`user:${userId}`);

    logger.info('User deleted', {
      userId,
    });

    return { message: 'User deleted successfully' };
  } catch (err) {
    logger.error('Delete profile failed', {
      userId,
      error: (err as any).message,
    });
    throw err;
  }
};
