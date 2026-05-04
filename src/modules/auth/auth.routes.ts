import express from 'express';
import { login, register } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { refresh } from './auth.controller';

const router = express.Router();

router.post('/refresh', asyncHandler(refresh));
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;
