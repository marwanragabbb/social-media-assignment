import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: true,
    dbName: 'social-media-auth',
  });
  console.log('MongoDB connected');
};
