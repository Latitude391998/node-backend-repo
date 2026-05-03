import mongoose from 'mongoose';
import { IUser } from '../../models/user.model';

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true },
  password: String,
  name: String,
});

export const User = mongoose.model('User', UserSchema);
