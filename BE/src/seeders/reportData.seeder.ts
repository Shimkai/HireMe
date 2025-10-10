import mongoose from 'mongoose';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import College from '../models/College.model';
import { config } from '../config/env';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleData = {
  colleges: [
    { name: 'Indian Institute of Technology Bombay' },
    { name: 'Indian Institute of Technology Delhi' },
    { name: 'Indian Institute of Technology Madras' },
    { name: 'Indian Institute of Technology Kanpur' },
    { name: 'Indian Institute of Technology Kharagpur' },
    { name: 'National Institute of Technology Trichy' },
    { name: 'National Institute of Technology Surathkal' },
    { name: 'Delhi Technological University' },
    { name: 'Netaji Subhas University of Technology' },
    { name: 'Indian Institute of Information Technology Allahabad' }
  ],
  
  recruiters: [
    {
      fullName: 'John Smith',
      email: 'john.smith@techcorp.com',
      mobileNumber: '9876543210',
      password: 'password123',
      role: 'Recruiter',
      recruiterDetails: {
        companyName: 'Tech Corp',
        industry: 'Technology',
        designation: 'Senior HR Manager',
        companyInfo: 'Leading technology company',
        companyWebsite: 'https://techcorp.com'
      }
    },
    {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@analytics.com',
      mobileNumber: '9876543211',
      password: 'password123',
      role: 'Recruiter',
      recruiterDetails: {
        companyName: 'Analytics Inc',
        industry: 'Data Analytics',
        designation: 'Talent Acquisition Lead',
        companyInfo: 'Data analytics and AI company',
        companyWebsite: 'https://analytics.com'
      }
    },
    {
      fullName: 'Mike Wilson',
      email: 'mike.wilson@websolutions.com',
      mobileNumber: '9876543212',
      password: 'password123',
      role: 'Recruiter',
      recruiterDetails: {
        companyName: 'Web Solutions',
        industry: 'Web Development',
        designation: 'HR Director',
        companyInfo: 'Full-stack web development company',
        companyWebsite: 'https://websolutions.com'
      }
    }
  ],

  students: [
    {
      fullName: 'Alice Johnson',
      email: 'alice.johnson@student.com',
      mobileNumber: '9876543220',
      password: 'password123',
      role: 'Student',
      studentDetails: {
        courseName: 'CSE',
        year: 'Final',
        cgpa: 8.5,
        college: null // Will be set after college creation
      }
    },
    {
      fullName: 'Bob Smith',
      email: 'bob.smith@student.com',
      mobileNumber: '9876543221',
      password: 'password123',
      role: 'Student',
      studentDetails: {
        courseName: 'IT',
        year: 'Final',
        cgpa: 8.2,
        college: null
      }
    },
    {
      fullName: 'Charlie Brown',
      email: 'charlie.brown@student.com',
      mobileNumber: '9876543222',
      password: 'password123',
      role: 'Student',
      studentDetails: {
        courseName: 'ECE',
        year: 'Final',
        cgpa: 8.8,
        college: null
      }
    },
    {
      fullName: 'Diana Prince',
      email: 'diana.prince@student.com',
      mobileNumber: '9876543223',
      password: 'password123',
      role: 'Student',
      studentDetails: {
        courseName: 'CSE',
        year: 'Final',
        cgpa: 9.1,
        college: null
      }
    },
    {
      fullName: 'Eve Wilson',
      email: 'eve.wilson@student.com',
      mobileNumber: '9876543224',
      password: 'password123',
      role: 'Student',
      studentDetails: {
        courseName: 'ME',
        year: 'Final',
        cgpa: 8.0,
        college: null
      }
    }
  ],

  tnp: [
    {
      fullName: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@tnp.com',
      mobileNumber: '9876543230',
      password: 'password123',
      role: 'TnP',
      tnpDetails: {
        designation: 'Director',
        employeeId: 'TNP001',
        college: null // Will be set after college creation
      }
    }
  ]
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await College.deleteMany({});

    console.log('Cleared existing data');

    // Create colleges
    const colleges = await College.insertMany(sampleData.colleges);
    console.log(`Created ${colleges.length} colleges`);

    // Create recruiters
    const recruiters = await User.insertMany(sampleData.recruiters);
    console.log(`Created ${recruiters.length} recruiters`);

    // Create students with college reference
    const studentsData = sampleData.students.map(student => ({
      ...student,
      studentDetails: {
        ...student.studentDetails,
        college: colleges[0]._id // Assign first college to all students
      }
    }));
    const students = await User.insertMany(studentsData);
    console.log(`Created ${students.length} students`);

    // Create TnP with college reference
    const tnpData = sampleData.tnp.map(tnp => ({
      ...tnp,
      tnpDetails: {
        ...tnp.tnpDetails,
        college: colleges[0]._id
      }
    }));
    const tnpUsers = await User.insertMany(tnpData);
    console.log(`Created ${tnpUsers.length} TnP users`);

    // Create jobs
    const jobs = [
      {
        title: 'Software Engineer',
        description: 'Full-stack development role with React and Node.js',
        companyName: 'Tech Corp',
        location: 'Mumbai',
        jobType: 'Full-time',
        designation: 'Software Engineer',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        eligibility: {
          minCGPA: 7.0,
          allowedCourses: ['CSE', 'IT', 'ECE'],
          maxBacklogs: 2,
          yearOfCompletion: [2024, 2025]
        },
        ctc: {
          min: 800000,
          max: 1200000,
          currency: 'INR'
        },
        experienceRequired: 'Fresher',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedBy: recruiters[0]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Work from Office',
        interviewProcess: {
          rounds: [
            { type: 'Technical', description: 'Coding round', duration: '2 hours' },
            { type: 'HR', description: 'HR interview', duration: '30 minutes' }
          ],
          totalRounds: 2
        }
      },
      {
        title: 'Data Analyst',
        description: 'Data analysis and visualization using Python and SQL',
        companyName: 'Analytics Inc',
        location: 'Bangalore',
        jobType: 'Full-time',
        designation: 'Data Analyst',
        skillsRequired: ['Python', 'SQL', 'Tableau', 'Excel'],
        eligibility: {
          minCGPA: 6.5,
          allowedCourses: ['CSE', 'IT', 'ECE', 'ME'],
          maxBacklogs: 3,
          yearOfCompletion: [2024, 2025]
        },
        ctc: {
          min: 600000,
          max: 1000000,
          currency: 'INR'
        },
        experienceRequired: 'Fresher',
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        postedBy: recruiters[1]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Hybrid',
        interviewProcess: {
          rounds: [
            { type: 'Technical', description: 'Data analysis test', duration: '1.5 hours' },
            { type: 'Technical', description: 'SQL interview', duration: '45 minutes' },
            { type: 'HR', description: 'HR interview', duration: '30 minutes' }
          ],
          totalRounds: 3
        }
      },
      {
        title: 'Frontend Developer',
        description: 'React and Angular development for web applications',
        companyName: 'Web Solutions',
        location: 'Delhi',
        jobType: 'Full-time',
        designation: 'Frontend Developer',
        skillsRequired: ['React', 'Angular', 'JavaScript', 'CSS', 'HTML'],
        eligibility: {
          minCGPA: 7.5,
          allowedCourses: ['CSE', 'IT'],
          maxBacklogs: 1,
          yearOfCompletion: [2024, 2025]
        },
        ctc: {
          min: 700000,
          max: 1100000,
          currency: 'INR'
        },
        experienceRequired: 'Fresher',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        postedBy: recruiters[2]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Work from Home',
        interviewProcess: {
          rounds: [
            { type: 'Technical', description: 'Frontend coding test', duration: '2 hours' },
            { type: 'HR', description: 'HR interview', duration: '30 minutes' }
          ],
          totalRounds: 2
        }
      },
      {
        title: 'Backend Developer',
        description: 'Node.js and Python backend development',
        companyName: 'Tech Corp',
        location: 'Pune',
        jobType: 'Full-time',
        designation: 'Backend Developer',
        skillsRequired: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        eligibility: {
          minCGPA: 7.0,
          allowedCourses: ['CSE', 'IT', 'ECE'],
          maxBacklogs: 2,
          yearOfCompletion: [2024, 2025]
        },
        ctc: {
          min: 800000,
          max: 1300000,
          currency: 'INR'
        },
        experienceRequired: 'Fresher',
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        postedBy: recruiters[0]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Hybrid',
        interviewProcess: {
          rounds: [
            { type: 'Technical', description: 'Backend coding test', duration: '2 hours' },
            { type: 'Technical', description: 'System design interview', duration: '1 hour' },
            { type: 'HR', description: 'HR interview', duration: '30 minutes' }
          ],
          totalRounds: 3
        }
      },
      {
        title: 'Machine Learning Engineer',
        description: 'ML model development and deployment using Python and TensorFlow',
        companyName: 'Analytics Inc',
        location: 'Hyderabad',
        jobType: 'Full-time',
        designation: 'ML Engineer',
        skillsRequired: ['Python', 'TensorFlow', 'AWS', 'Machine Learning'],
        eligibility: {
          minCGPA: 8.0,
          allowedCourses: ['CSE', 'IT'],
          maxBacklogs: 1,
          yearOfCompletion: [2024, 2025]
        },
        ctc: {
          min: 1000000,
          max: 1500000,
          currency: 'INR'
        },
        experienceRequired: 'Fresher',
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        postedBy: recruiters[1]._id,
        status: 'Approved',
        jobCategory: 'Technical',
        workMode: 'Work from Office',
        interviewProcess: {
          rounds: [
            { type: 'Technical', description: 'ML coding test', duration: '2 hours' },
            { type: 'Technical', description: 'ML theory interview', duration: '1 hour' },
            { type: 'Technical', description: 'System design interview', duration: '1 hour' },
            { type: 'HR', description: 'HR interview', duration: '30 minutes' }
          ],
          totalRounds: 4
        }
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`Created ${createdJobs.length} jobs`);

    // Create applications with some selections
    const applications = [
      {
        studentId: students[0]._id,
        jobId: createdJobs[0]._id,
        status: 'Accepted',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resume: {
          filename: 'alice_johnson_resume.pdf',
          originalName: 'Alice_Johnson_Resume.pdf',
          mimetype: 'application/pdf',
          size: 1024000,
          path: '/uploads/resumes/alice_johnson_resume.pdf',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        studentId: students[1]._id,
        jobId: createdJobs[0]._id,
        status: 'Under Review',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'bob_smith_resume.pdf',
          originalName: 'Bob_Smith_Resume.pdf',
          mimetype: 'application/pdf',
          size: 950000,
          path: '/uploads/resumes/bob_smith_resume.pdf',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: false
      },
      {
        studentId: students[2]._id,
        jobId: createdJobs[1]._id,
        status: 'Accepted',
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'charlie_brown_resume.pdf',
          originalName: 'Charlie_Brown_Resume.pdf',
          mimetype: 'application/pdf',
          size: 1100000,
          path: '/uploads/resumes/charlie_brown_resume.pdf',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        studentId: students[3]._id,
        jobId: createdJobs[1]._id,
        status: 'Rejected',
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'diana_prince_resume.pdf',
          originalName: 'Diana_Prince_Resume.pdf',
          mimetype: 'application/pdf',
          size: 980000,
          path: '/uploads/resumes/diana_prince_resume.pdf',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rejectionReason: 'Does not meet minimum CGPA requirement'
      },
      {
        studentId: students[0]._id,
        jobId: createdJobs[2]._id,
        status: 'Accepted',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'alice_johnson_resume.pdf',
          originalName: 'Alice_Johnson_Resume.pdf',
          mimetype: 'application/pdf',
          size: 1024000,
          path: '/uploads/resumes/alice_johnson_resume.pdf',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        studentId: students[4]._id,
        jobId: createdJobs[3]._id,
        status: 'Shortlisted',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'eve_wilson_resume.pdf',
          originalName: 'Eve_Wilson_Resume.pdf',
          mimetype: 'application/pdf',
          size: 1050000,
          path: '/uploads/resumes/eve_wilson_resume.pdf',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        studentId: students[1]._id,
        jobId: createdJobs[4]._id,
        status: 'Accepted',
        appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        resume: {
          filename: 'bob_smith_resume.pdf',
          originalName: 'Bob_Smith_Resume.pdf',
          mimetype: 'application/pdf',
          size: 950000,
          path: '/uploads/resumes/bob_smith_resume.pdf',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        viewedByRecruiter: true,
        viewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdApplications = await Application.insertMany(applications);
    console.log(`Created ${createdApplications.length} applications`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Colleges: ${colleges.length}`);
    console.log(`   - Recruiters: ${recruiters.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - TnP Users: ${tnpUsers.length}`);
    console.log(`   - Jobs: ${createdJobs.length}`);
    console.log(`   - Applications: ${createdApplications.length}`);
    console.log(`   - Selected Applications: ${applications.filter(app => app.status === 'Selected').length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
