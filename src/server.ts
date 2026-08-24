import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { config } from './config/env';
import { logger } from './config/logger';
import { connectRedis, disconnectRedis } from './config/redis';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${config.env} on port ${config.port}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async (err?: Error) => {
      if (err) {
        logger.error(`Error shutting down server: ${err.message}`);
        process.exit(1);
      }

      await disconnectDB();
      await disconnectRedis();

      logger.info('Cleanup complete. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();