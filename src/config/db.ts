import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info('MongoDB connected');
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (err: any) {
    logger.error(`Error disconnecting MongoDB: ${err.message}`);
  }
};