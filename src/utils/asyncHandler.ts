import { Request, Response, NextFunction } from 'express';

// FIX: By adding <TReq extends Request>, we tell TypeScript that fn can accept
// the standard Request, OR any custom request (like AuthRequest) that extends it.
export const asyncHandler =
  <TReq extends Request = Request>(fn: (req: TReq, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    // We safely cast the incoming standard req to your custom TReq
    Promise.resolve(fn(req as TReq, res, next)).catch(next);