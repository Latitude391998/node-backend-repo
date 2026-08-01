// import express from 'express';
// import multer from 'multer';
// import { uploadReceipt, getReceipts } from './receipt.controller';
// import { protect } from '../../middlewares/auth.middleware';
// import { asyncHandler } from '../../utils/asyncHandler';

// const upload = multer({ dest: 'uploads/' });
// const router = express.Router();

// router.use(protect);

// router.get('/', asyncHandler(getReceipts));
// router.post('/upload', upload.single('file'), asyncHandler(uploadReceipt));

// export default router;

import express from 'express';
import multer from 'multer';
import { uploadReceipt, getReceipts } from './receipt.controller';
import { protect } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

// FIX: Use memoryStorage instead of local disk destination
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

router.use(protect);
router.get('/', asyncHandler(getReceipts));
router.post('/upload', upload.single('file'), asyncHandler(uploadReceipt));

export default router;
