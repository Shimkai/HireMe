import mongoose from 'mongoose';
import College from '../models/College.model';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const colleges = [
  // IITs
  { name: 'Indian Institute of Technology Bombay' },
  { name: 'Indian Institute of Technology Delhi' },
  { name: 'Indian Institute of Technology Madras' },
  { name: 'Indian Institute of Technology Kanpur' },
  { name: 'Indian Institute of Technology Kharagpur' },
  { name: 'Indian Institute of Technology Roorkee' },
  { name: 'Indian Institute of Technology Guwahati' },
  { name: 'Indian Institute of Technology Hyderabad' },
  { name: 'Indian Institute of Technology Indore' },
  { name: 'Indian Institute of Technology (BHU) Varanasi' },
  
  // NITs
  { name: 'National Institute of Technology Trichy' },
  { name: 'National Institute of Technology Karnataka Surathkal' },
  { name: 'National Institute of Technology Rourkela' },
  { name: 'National Institute of Technology Warangal' },
  { name: 'National Institute of Technology Calicut' },
  { name: 'National Institute of Technology Durgapur' },
  { name: 'National Institute of Technology Kurukshetra' },
  { name: 'National Institute of Technology Jaipur' },
  { name: 'National Institute of Technology Silchar' },
  { name: 'National Institute of Technology Hamirpur' },
  
  // IIITs
  { name: 'International Institute of Information Technology Hyderabad' },
  { name: 'International Institute of Information Technology Bangalore' },
  { name: 'International Institute of Information Technology Allahabad' },
  { name: 'ABV-Indian Institute of Information Technology and Management Gwalior' },
  
  // Other Premier Institutes
  { name: 'Birla Institute of Technology and Science Pilani' },
  { name: 'Vellore Institute of Technology' },
  { name: 'Manipal Institute of Technology' },
  { name: 'Delhi Technological University' },
  { name: 'Netaji Subhas University of Technology Delhi' },
  { name: 'SRM Institute of Science and Technology' },
  { name: 'Amity University Noida' },
  { name: 'Thapar Institute of Engineering and Technology' },
  { name: 'PES University Bangalore' },
  { name: 'RV College of Engineering Bangalore' },
  { name: 'BMS College of Engineering Bangalore' },
  { name: 'College of Engineering Pune' },
  { name: 'Jadavpur University Kolkata' },
  { name: 'Anna University Chennai' },
  { name: 'PSG College of Technology Coimbatore' },
  { name: 'Bangalore Institute of Technology' },
  
  // State Universities
  { name: 'University of Mumbai' },
  { name: 'University of Delhi' },
  { name: 'Pune University' },
  { name: 'Gujarat Technological University' },
  { name: 'Rajasthan Technical University' },
  { name: 'Dr. APJ Abdul Kalam Technical University Lucknow' },
  { name: 'Osmania University Hyderabad' },
  { name: 'Jawaharlal Nehru Technological University Hyderabad' },
  { name: 'Visvesvaraya Technological University Belgaum' },
  { name: 'Anna University Regional Campuses' },
];

const seedColleges = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireme';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected for seeding');

    // Clear existing colleges
    await College.deleteMany({});
    logger.info('Cleared existing colleges');

    // Insert colleges
    const inserted = await College.insertMany(colleges);
    logger.info(`✅ Seeded ${inserted.length} colleges successfully`);

    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding colleges:', error);
    process.exit(1);
  }
};

// Run seeder
seedColleges();

