import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('MongoDB connected');
};

// =========================
// src/config/redis.ts
// =========================
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();
