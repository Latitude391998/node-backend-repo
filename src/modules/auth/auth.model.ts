import mongoose from 'mongoose';
import { IUser } from '../../models/user.model';

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true },
  password: String,
  name: String,
  // NEW: additive, defaulted field. Does not change register/login behavior;
  // existing + new users default to 'USER'. Promote to 'ADMIN' directly in the
  // database to grant access to admin-only routes (e.g. product creation).
  role: { type: String, enum: ['USER', 'ADMIN', 'MANAGER'], default: 'USER' },
});

export const User = mongoose.model('User', UserSchema);