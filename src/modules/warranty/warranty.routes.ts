import express from 'express';
import { submitClaim, getClaims } from './warranty.controller';
import { protect } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = express.Router();

router.use(protect);

router.post('/claim', asyncHandler(submitClaim));
router.get('/claims', asyncHandler(getClaims));

export default router;
