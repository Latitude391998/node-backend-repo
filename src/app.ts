import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/requestLogger';
import { corsOptions } from './config/cors';
import healthRoutes from './routes/health.routes';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// 👇 ADD THIS HERE (TOP LEVEL)
const app = express();
app.use(helmet());
app.use(mongoSanitize());
app.use(requestLogger);

app.use(cookieParser());
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(cors(corsOptions));
app.use(express.json());

app.use('/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);

app.use(errorHandler);

export default app;
