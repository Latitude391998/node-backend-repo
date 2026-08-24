import mongoose from 'mongoose';
import { logger } from '../config/logger';
import { redisClient } from '../config/redis';

type ServiceStatus = 'UP' | 'DOWN';

interface HealthStatus {
  status: 'UP' | 'DOWN';
  uptime: number;
  timestamp: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
  };
}

export const checkHealth = async (): Promise<HealthStatus> => {
  const start = Date.now();

  const health: HealthStatus = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      redis: 'DOWN',
    },
  };

  // 🔹 MongoDB Check
  try {
    const dbState = mongoose.connection.readyState;
    health.services.database = dbState === 1 ? 'UP' : 'DOWN';

    if (dbState !== 1) {
      logger.error('Database health check failed', {
        state: dbState,
      });
    }
  } catch (err: any) {
    logger.error('Database health check exception', {
      error: err.message,
    });
    health.services.database = 'DOWN';
  }

  // 🔹 Redis Check
  try {
    health.services.redis = redisClient.isOpen ? 'UP' : 'DOWN';

    if (!redisClient.isOpen) {
      logger.error('Redis health check failed');
    }
  } catch (err: any) {
    logger.error('Redis health check exception', {
      error: err.message,
    });
    health.services.redis = 'DOWN';
  }

  // 🔥 Final Status
  const isHealthy = Object.values(health.services).every((service) => service === 'UP');

  health.status = isHealthy ? 'UP' : 'DOWN';

  const duration = Date.now() - start;

  // ✅ Logging based on status
  if (health.status === 'DOWN') {
    logger.error('System health check FAILED', {
      health,
      duration,
    });
  } else if (Object.values(health.services).includes('DOWN')) {
    logger.warn('System health check DEGRADED', {
      health,
      duration,
    });
  } else {
    logger.info('System health check OK', {
      duration,
    });
  }

  return health;
};