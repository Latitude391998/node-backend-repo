import express from 'express';
import { login, logout, register, refresh } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = express.Router();

router.post('/refresh', asyncHandler(refresh));
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));

export default router;
