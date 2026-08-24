import express from 'express';
import { createProduct, getProducts } from './product.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = express.Router();

// Public: anyone can browse/search/filter the catalog, no auth required.
router.get('/', asyncHandler(getProducts));

// Admin-only: creating catalog entries requires an authenticated admin.
router.post('/', protect, requireAdmin, asyncHandler(createProduct));

export default router;
