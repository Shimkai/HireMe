import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireme';

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);

    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error: any) {
    logger.error('❌ Database connection failed:', error.message || error);
    logger.error('💡 Make sure MongoDB is running and MONGODB_URI is correct in .env file');
    // Don't exit - allow server to start but API calls will fail
    // In production, you might want to exit here: process.exit(1);
    // Re-throw so startServer can handle it, but wrap in a way that won't cause unhandled rejection
    const dbError = new Error(`Database connection failed: ${error.message || error}`);
    throw dbError;
  }
};

