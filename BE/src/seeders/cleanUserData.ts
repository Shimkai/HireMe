import mongoose from 'mongoose';
import User from '../models/User.model';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const cleanUserData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireme';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected for cleaning user data');

    // Find all users with studentDetails
    const users = await User.find({ role: 'Student', studentDetails: { $exists: true } });
    logger.info(`Found ${users.length} students to clean`);

    let cleanedCount = 0;
    for (const user of users) {
      let needsUpdate = false;
      
      if (user.studentDetails) {
        // Remove undefined nested objects
        if (user.studentDetails.address === undefined) {
          delete user.studentDetails.address;
          needsUpdate = true;
        }
        if (user.studentDetails.tenthMarks === undefined) {
          delete user.studentDetails.tenthMarks;
          needsUpdate = true;
        }
        if (user.studentDetails.twelfthMarks === undefined) {
          delete user.studentDetails.twelfthMarks;
          needsUpdate = true;
        }
        if (user.studentDetails.lastSemesterMarksheet === undefined) {
          delete user.studentDetails.lastSemesterMarksheet;
          needsUpdate = true;
        }
        
        // Clean nested objects that have undefined values
        if (user.studentDetails && user.studentDetails.address && typeof user.studentDetails.address === 'object') {
          const cleanAddress: any = {};
          Object.keys(user.studentDetails.address).forEach(key => {
            const value = (user.studentDetails!.address as any)[key];
            if (value !== undefined && value !== null && value !== '') {
              cleanAddress[key] = value;
            }
          });
          if (Object.keys(cleanAddress).length === 0) {
            delete user.studentDetails.address;
          } else {
            user.studentDetails.address = cleanAddress;
          }
          needsUpdate = true;
        }
        
        if (user.studentDetails && user.studentDetails.tenthMarks && typeof user.studentDetails.tenthMarks === 'object') {
          const cleanTenthMarks: any = {};
          Object.keys(user.studentDetails.tenthMarks).forEach(key => {
            const value = (user.studentDetails!.tenthMarks as any)[key];
            if (value !== undefined && value !== null && value !== '') {
              cleanTenthMarks[key] = value;
            }
          });
          if (Object.keys(cleanTenthMarks).length === 0) {
            delete user.studentDetails.tenthMarks;
          } else {
            user.studentDetails.tenthMarks = cleanTenthMarks;
          }
          needsUpdate = true;
        }
        
        if (user.studentDetails && user.studentDetails.twelfthMarks && typeof user.studentDetails.twelfthMarks === 'object') {
          const cleanTwelfthMarks: any = {};
          Object.keys(user.studentDetails.twelfthMarks).forEach(key => {
            const value = (user.studentDetails!.twelfthMarks as any)[key];
            if (value !== undefined && value !== null && value !== '') {
              cleanTwelfthMarks[key] = value;
            }
          });
          if (Object.keys(cleanTwelfthMarks).length === 0) {
            delete user.studentDetails.twelfthMarks;
          } else {
            user.studentDetails.twelfthMarks = cleanTwelfthMarks;
          }
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await user.save();
        cleanedCount++;
        logger.info(`Cleaned user: ${user.email}`);
      }
    }

    logger.info(`✅ Cleaned ${cleanedCount} users successfully`);
    logger.info('User data cleaning completed');

    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error cleaning user data:', error);
    process.exit(1);
  }
};

// Run cleaner
cleanUserData();
