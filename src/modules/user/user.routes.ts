import express from 'express';
import { profile, update, remove } from './user.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { slidingToken } from '../../middlewares/slidingToken.middleware';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, slidingToken);

router.get('/profile', asyncHandler(profile));
router.put('/update', asyncHandler(update));
router.delete('/delete', asyncHandler(remove));

export default router;
