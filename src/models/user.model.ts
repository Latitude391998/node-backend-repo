import { Types } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  _id: string | Types.ObjectId;
  // NEW: role backs the RBAC permissions already consumed by the frontend (see store/authSlice.ts).
  // Optional + defaulted so it is fully backward compatible with existing documents/code paths.
  role?: 'USER' | 'ADMIN' | 'MANAGER';
}