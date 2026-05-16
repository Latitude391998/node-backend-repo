import { CorsOptions } from 'cors';
import { config } from './env';
import { logger } from './logger';

// const allowedOrigins = [
//   config.clientUrl, // frontend domain
// ];
const allowedOrigins = ['http://localhost:3000', 'https://localhost:3000', config.clientUrl];
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
