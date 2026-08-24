import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, register, refresh } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = express.Router();

// FIX: Prevent brute-force password attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/refresh', asyncHandler(refresh));
router.post('/register', asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.post('/logout', asyncHandler(logout));

export default router;