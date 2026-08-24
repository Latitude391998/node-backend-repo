import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  affiliateLink?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    // Optional external/affiliate link, e.g. for products the store doesn't fulfil itself.
    affiliateLink: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Soft-delete / hide flag so listings can be pulled without destroying history.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// Supports category + price-range filtering used by GET /api/products.
ProductSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
