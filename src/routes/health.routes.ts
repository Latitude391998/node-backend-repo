import express from 'express';
import { checkHealth } from '../utils/healthChecker';
import { logger } from '../config/logger';

const router = express.Router();

router.get('/ready', async (req, res) => {
  try {
    const health = await checkHealth();

    logger.info('Readiness check hit', {
      status: health.status,
    });

    return res.status(health.status === 'UP' ? 200 : 503).json(health);
  } catch (err: any) {
    logger.error('Readiness check failed', {
      error: err.message,
    });

    return res.status(503).json({
      status: 'DOWN',
      error: err.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    if (req.headers['x-health-token'] !== process.env.HEALTH_TOKEN) {
      logger.warn('Unauthorized health check attempt', {
        ip: req.ip,
      });

      return res.status(403).json({ message: 'Forbidden' });
    }

    const health = await checkHealth();

    logger.info('Deep health check executed', {
      status: health.status,
    });

    return res.status(health.status === 'UP' ? 200 : 503).json(health);
  } catch (err: any) {
    logger.error('Deep health check failed', {
      error: err.message,
    });

    return res.status(503).json({
      status: 'DOWN',
      error: err.message,
    });
  }
});

export default router;
