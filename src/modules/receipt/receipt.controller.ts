import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../models/req.model';
import { Receipt } from './receipt.model';

export const uploadReceipt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // FIX: Upload req.file.buffer to AWS S3 / Cloudinary here.
    // const cloudUploadResult = await uploadToCloudinary(req.file.buffer);
    const fakeCloudUrl = `https://cloud-storage.com/${req.file.originalname}`;

    const newReceipt = await Receipt.create({
      userId: req.user.id,
      filename: req.file.originalname,
      merchant: req.body.merchant || 'Sample Merchant',
      amount: parseFloat(req.body.amount) || 49.99,
      filePath: fakeCloudUrl, // Save the cloud URL, not the local path
      status: 'PROCESSED',
    });

    // const newReceipt = await Receipt.create({
    //   userId: req.user.id,
    //   filename: req.file.originalname,
    //   merchant: req.body.merchant || 'Sample Merchant',
    //   amount: parseFloat(req.body.amount) || 49.99,
    //   filePath: req.file.path,
    //   status: 'PROCESSED',
    // });

    res.status(201).json({
      message: 'Receipt uploaded successfully',
      id: newReceipt._id,
      filename: newReceipt.filename,
      merchant: newReceipt.merchant,
      amount: newReceipt.amount,
      date: newReceipt.date,
      status: newReceipt.status,
    });
  } catch (err) {
    next(err);
  }
};

export const getReceipts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const query = {
      userId: req.user.id,
      $or: [{ merchant: { $regex: search, $options: 'i' } }, { filename: { $regex: search, $options: 'i' } }],
    };

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: receipts.map((r) => ({
        id: r._id,
        filename: r.filename,
        merchant: r.merchant,
        amount: r.amount,
        date: r.date.toISOString().split('T')[0],
        status: r.status,
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};