import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase } from './db/connect';
import { createApp } from './app';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = await createApp();

    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during server startup', error);
  process.exit(1);
});
