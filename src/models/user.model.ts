import { Types } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  _id: string | Types.ObjectId;
}
