import bcrypt from 'bcryptjs';

export const hashData = async (data: string) => {
  return await bcrypt.hash(data, 10);
};

export const compareHash = async (data: string, hash: string) => {
  return await bcrypt.compare(data, hash);
};