import mongoose from 'mongoose';

const ErrorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  route: String,
  method: String,
  timestamp: { type: Date, default: Date.now },
});

export const ErrorLog = mongoose.model('ErrorLog', ErrorLogSchema);