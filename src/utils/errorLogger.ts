import { ErrorLog } from '../models/ErrorLog.model';

export const logErrorToDB = async (err: any, req: any) => {
  await ErrorLog.create({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });
};