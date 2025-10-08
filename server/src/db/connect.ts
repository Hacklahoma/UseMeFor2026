import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../config/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in configuration');
    }
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', error);
  }
};
