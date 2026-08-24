import { createClient } from 'redis';
import { logger } from './logger';

// export const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

// redisClient.connect();
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err: any) {
    logger.error(`Redis connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    logger.info('Redis disconnected');
  } catch (err: any) {
    logger.error(`Error disconnecting Redis: ${err.message}`);
  }
};