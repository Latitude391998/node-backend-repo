import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  merchant: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  filePath: string;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    merchant: { type: String, default: 'Unknown Merchant' },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['PENDING', 'PROCESSED', 'REJECTED'], default: 'PROCESSED' },
    filePath: { type: String, required: true },
  },
  { timestamps: true },
);

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);