import { Request } from 'express';

export interface AuthRequest extends Request {
  user: { id: string };
  // file: { originalname: string; path: string };
}
