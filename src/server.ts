import app from './app';
import { connectDatabase } from './config/database';
import { redisClient } from './config/redis';
import { env } from './config/env';

const startServer = async () => {
  await connectDatabase();
  await redisClient.connect();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
