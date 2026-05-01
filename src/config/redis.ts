import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (error) => {
  console.error('Redis Client Error', error);
});
