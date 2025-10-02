import mongoose from 'mongoose';
import User from '../models/User.model';
import College from '../models/College.model';
import Job from '../models/Job.model';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const seedTestData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireme';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected for seeding test data');

    // Get a college for reference
    const college = await College.findOne();
    if (!college) {
      logger.error('No colleges found. Run college seeder first.');
      process.exit(1);
    }

    // Clear existing test data
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Job.deleteMany({});
    logger.info('Cleared existing test data');

    // Create TnP Officer
    const tnpUser = await User.create({
      fullName: 'TnP Officer',
      email: 'tnp@test.com',
      mobileNumber: '9876543210',
      password: 'password123',
      role: 'TnP',
      tnpDetails: {
        college: college._id,
        designation: 'Training and Placement Officer',
        employeeId: 'TNP001',
      },
    });
    logger.info('✅ Created TnP Officer');

    // Create Students
    const students = await User.create([
      {
        fullName: 'John Doe',
        email: 'john@test.com',
        mobileNumber: '9876543211',
        password: 'password123',
        role: 'Student',
        studentDetails: {
          courseName: 'Computer Science Engineering',
          college: college._id,
          isVerified: true,
          placementStatus: 'Not Placed',
          cgpa: 8.5,
          yearOfCompletion: 2024,
          registrationNumber: 'CS2024001',
        },
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@test.com',
        mobileNumber: '9876543212',
        password: 'password123',
        role: 'Student',
        studentDetails: {
          courseName: 'Information Technology',
          college: college._id,
          isVerified: true,
          placementStatus: 'Not Placed',
          cgpa: 9.0,
          yearOfCompletion: 2024,
          registrationNumber: 'IT2024001',
        },
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike@test.com',
        mobileNumber: '9876543213',
        password: 'password123',
        role: 'Student',
        studentDetails: {
          courseName: 'Electronics Engineering',
          college: college._id,
          isVerified: false,
          placementStatus: 'Not Placed',
          cgpa: 7.8,
          yearOfCompletion: 2024,
          registrationNumber: 'EC2024001',
        },
      },
    ]);
    logger.info(`✅ Created ${students.length} students`);

    // Create Recruiters
    const recruiters = await User.create([
      {
        fullName: 'Sarah Williams',
        email: 'recruiter1@test.com',
        mobileNumber: '9876543214',
        password: 'password123',
        role: 'Recruiter',
        recruiterDetails: {
          companyName: 'Tech Solutions Inc',
          industry: 'Information Technology',
          designation: 'HR Manager',
          companyInfo: 'Leading IT services and consulting company',
          companyWebsite: 'https://techsolutions.example.com',
          verificationStatus: 'Verified',
        },
      },
      {
        fullName: 'David Brown',
        email: 'recruiter2@test.com',
        mobileNumber: '9876543215',
        password: 'password123',
        role: 'Recruiter',
        recruiterDetails: {
          companyName: 'InnovateCorp',
          industry: 'Software Development',
          designation: 'Talent Acquisition Lead',
          companyInfo: 'Innovative software products company',
          companyWebsite: 'https://innovatecorp.example.com',
          verificationStatus: 'Verified',
        },
      },
    ]);
    logger.info(`✅ Created ${recruiters.length} recruiters`);

    // Create Jobs
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30); // 30 days from now

    const jobs = await Job.create([
      {
        title: 'Software Development Engineer',
        description: 'We are looking for talented software engineers to join our team.',
        companyName: 'Tech Solutions Inc',
        location: 'Bangalore',
        jobType: 'Full-time',
        designation: 'SDE-1',
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        eligibility: {
          minCGPA: 7.0,
          allowedCourses: ['Computer Science Engineering', 'Information Technology'],
          maxBacklogs: 0,
          yearOfCompletion: [2024],
        },
        ctc: {
          min: 600000,
          max: 800000,
          currency: 'INR',
        },
        experienceRequired: 'Fresher',
        applicationDeadline: deadline,
        postedBy: recruiters[0]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Hybrid',
        approvedBy: tnpUser._id,
        interviewProcess: {
          rounds: [
            { type: 'Technical Round 1', description: 'DSA and problem solving', duration: '60 min' },
            { type: 'Technical Round 2', description: 'System design', duration: '60 min' },
            { type: 'HR Round', description: 'Cultural fit', duration: '30 min' },
          ],
          totalRounds: 3,
        },
      },
      {
        title: 'Frontend Developer Intern',
        description: 'Internship opportunity for frontend development enthusiasts.',
        companyName: 'InnovateCorp',
        location: 'Remote',
        jobType: 'Internship',
        designation: 'Frontend Intern',
        skillsRequired: ['HTML', 'CSS', 'JavaScript', 'React'],
        eligibility: {
          minCGPA: 6.5,
          allowedCourses: ['Computer Science Engineering', 'Information Technology', 'Electronics Engineering'],
          maxBacklogs: 1,
          yearOfCompletion: [2024, 2025],
        },
        ctc: {
          min: 15000,
          max: 25000,
          currency: 'INR',
        },
        experienceRequired: 'Fresher',
        applicationDeadline: deadline,
        postedBy: recruiters[1]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Work from Home',
        approvedBy: tnpUser._id,
        interviewProcess: {
          rounds: [
            { type: 'Technical Interview', description: 'Coding and frontend basics', duration: '45 min' },
          ],
          totalRounds: 1,
        },
      },
      {
        title: 'Backend Developer',
        description: 'Looking for backend developers with strong problem-solving skills.',
        companyName: 'Tech Solutions Inc',
        location: 'Hyderabad',
        jobType: 'Full-time',
        designation: 'Backend Developer',
        skillsRequired: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
        eligibility: {
          minCGPA: 7.5,
          allowedCourses: ['Computer Science Engineering'],
          maxBacklogs: 0,
          yearOfCompletion: [2024],
        },
        ctc: {
          min: 700000,
          max: 900000,
          currency: 'INR',
        },
        experienceRequired: 'Fresher',
        applicationDeadline: deadline,
        postedBy: recruiters[0]._id,
        status: 'Pending',
        jobCategory: 'Technical',
        workMode: 'Work from Office',
        interviewProcess: {
          rounds: [],
          totalRounds: 2,
        },
      },
    ]);
    logger.info(`✅ Created ${jobs.length} jobs`);

    logger.info('\n=== Test Data Seeded Successfully ===');
    logger.info('\nTest Accounts Created:');
    logger.info('TnP Officer:   tnp@test.com / password123');
    logger.info('Student 1:     john@test.com / password123 (Verified)');
    logger.info('Student 2:     jane@test.com / password123 (Verified)');
    logger.info('Student 3:     mike@test.com / password123 (Not Verified)');
    logger.info('Recruiter 1:   recruiter1@test.com / password123');
    logger.info('Recruiter 2:   recruiter2@test.com / password123');

    await mongoose.connection.close();
    logger.info('\nMongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding test data:', error);
    process.exit(1);
  }
};

// Run seeder
seedTestData();

