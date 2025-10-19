import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.model';
import { logger } from '../utils/logger';

dotenv.config();

const OLD_NAME = 'Amity University Noida';
const NEW_NAME = 'G. H. Raisoni College of Engineering and Management , Pune';

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireme';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected for migration');

    const updated = await College.findOneAndUpdate(
      { name: OLD_NAME },
      { $set: { name: NEW_NAME } },
      { new: true }
    );

    if (updated) {
      logger.info(`✅ Renamed college to: ${updated.name}`);
    } else {
      logger.warn(`No college found with name: ${OLD_NAME}`);
    }

    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  }
}

run();


