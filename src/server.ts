import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server running in ${config.env} on port ${config.port}`);
    });
  } catch (err) {
    console.error('Startup failed', err);
    process.exit(1);
  }
};

startServer();
