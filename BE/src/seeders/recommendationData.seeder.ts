import mongoose from 'mongoose';
import User from '../models/User.model';
import Job from '../models/Job.model';
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

const sampleSkills = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue.js',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'GCP', 'Machine Learning', 'Data Science', 'Artificial Intelligence',
  'Blockchain', 'DevOps', 'CI/CD', 'Git', 'Linux', 'TypeScript', 'Express.js',
  'Spring Boot', 'Django', 'Flask', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'SQL', 'NoSQL', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
];

const sampleJobs = [
  {
    title: 'Full Stack Developer',
    description: 'We are looking for a passionate Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
    companyName: 'TechCorp Solutions',
    location: 'Bangalore, India',
    jobType: 'Full-time',
    designation: 'Software Engineer',
    skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js'],
    eligibility: {
      minCGPA: 7.0,
      allowedCourses: ['Computer Science', 'Information Technology', 'Software Engineering'],
      maxBacklogs: 2,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 8, max: 15, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-03-31',
    jobCategory: 'Technical',
    workMode: 'Hybrid',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '60 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '30 minutes' }
      ],
      totalRounds: 2
    }
  },
  {
    title: 'Data Scientist',
    description: 'Join our data science team to work on cutting-edge machine learning projects. You will analyze large datasets and build predictive models.',
    companyName: 'DataTech Innovations',
    location: 'Mumbai, India',
    jobType: 'Full-time',
    designation: 'Data Scientist',
    skillsRequired: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow', 'Pandas'],
    eligibility: {
      minCGPA: 8.0,
      allowedCourses: ['Computer Science', 'Data Science', 'Mathematics', 'Statistics'],
      maxBacklogs: 1,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 12, max: 20, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-02-28',
    jobCategory: 'Technical',
    workMode: 'Work from Office',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '90 minutes' },
        { name: 'Case Study', type: 'Online', duration: '120 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '45 minutes' }
      ],
      totalRounds: 3
    }
  },
  {
    title: 'DevOps Engineer',
    description: 'We need a DevOps Engineer to help us scale our infrastructure and improve our deployment processes.',
    companyName: 'CloudScale Technologies',
    location: 'Pune, India',
    jobType: 'Full-time',
    designation: 'DevOps Engineer',
    skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    eligibility: {
      minCGPA: 7.5,
      allowedCourses: ['Computer Science', 'Information Technology'],
      maxBacklogs: 2,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 10, max: 18, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-03-15',
    jobCategory: 'Technical',
    workMode: 'Hybrid',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '75 minutes' },
        { name: 'System Design', type: 'Online', duration: '60 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '30 minutes' }
      ],
      totalRounds: 3
    }
  },
  {
    title: 'Frontend Developer',
    description: 'Join our frontend team to create beautiful and responsive user interfaces using modern web technologies.',
    companyName: 'WebCraft Studios',
    location: 'Delhi, India',
    jobType: 'Full-time',
    designation: 'Frontend Developer',
    skillsRequired: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    eligibility: {
      minCGPA: 6.5,
      allowedCourses: ['Computer Science', 'Information Technology', 'Web Development'],
      maxBacklogs: 3,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 6, max: 12, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-02-15',
    jobCategory: 'Technical',
    workMode: 'Work from Home',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '60 minutes' },
        { name: 'Coding Challenge', type: 'Online', duration: '90 minutes' },
        { name: 'HR Round', type: 'Online', duration: '30 minutes' }
      ],
      totalRounds: 3
    }
  },
  {
    title: 'Backend Developer',
    description: 'We are looking for a Backend Developer to build scalable server-side applications and APIs.',
    companyName: 'ServerSide Solutions',
    location: 'Chennai, India',
    jobType: 'Full-time',
    designation: 'Backend Developer',
    skillsRequired: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Microservices'],
    eligibility: {
      minCGPA: 7.0,
      allowedCourses: ['Computer Science', 'Information Technology'],
      maxBacklogs: 2,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 8, max: 16, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-03-10',
    jobCategory: 'Technical',
    workMode: 'Hybrid',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '75 minutes' },
        { name: 'System Design', type: 'Online', duration: '60 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '30 minutes' }
      ],
      totalRounds: 3
    }
  },
  {
    title: 'AI/ML Engineer',
    description: 'Join our AI team to develop machine learning models and AI solutions for various business problems.',
    companyName: 'AI Innovations Ltd',
    location: 'Hyderabad, India',
    jobType: 'Full-time',
    designation: 'AI/ML Engineer',
    skillsRequired: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow'],
    eligibility: {
      minCGPA: 8.5,
      allowedCourses: ['Computer Science', 'Artificial Intelligence', 'Machine Learning'],
      maxBacklogs: 1,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 15, max: 25, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-02-20',
    jobCategory: 'Technical',
    workMode: 'Work from Office',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '90 minutes' },
        { name: 'ML Case Study', type: 'Online', duration: '120 minutes' },
        { name: 'Research Discussion', type: 'Online', duration: '60 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '45 minutes' }
      ],
      totalRounds: 4
    }
  },
  {
    title: 'Software Engineer Intern',
    description: 'Join our team as a software engineering intern to work on real-world projects and gain industry experience.',
    companyName: 'StartupTech Solutions',
    location: 'Bangalore, India',
    jobType: 'Internship',
    designation: 'Software Engineer Intern',
    skillsRequired: ['Python', 'JavaScript', 'Git', 'Agile'],
    eligibility: {
      minCGPA: 6.0,
      allowedCourses: ['Computer Science', 'Information Technology', 'Software Engineering'],
      maxBacklogs: 5,
      yearOfCompletion: [2024, 2025, 2026]
    },
    ctc: { min: 3, max: 5, currency: 'LPA' },
    experienceRequired: 'Fresher',
    applicationDeadline: '2025-03-05',
    jobCategory: 'Technical',
    workMode: 'Work from Office',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '45 minutes' },
        { name: 'HR Round', type: 'Online', duration: '30 minutes' }
      ],
      totalRounds: 2
    }
  },
  {
    title: 'Database Administrator',
    description: 'We are looking for a Database Administrator to manage and optimize our database systems.',
    companyName: 'DataFlow Systems',
    location: 'Pune, India',
    jobType: 'Full-time',
    designation: 'Database Administrator',
    skillsRequired: ['SQL', 'PostgreSQL', 'MongoDB', 'Database Design'],
    eligibility: {
      minCGPA: 7.0,
      allowedCourses: ['Computer Science', 'Information Technology', 'Database Management'],
      maxBacklogs: 2,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 7, max: 12, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-03-31',
    jobCategory: 'Technical',
    workMode: 'Hybrid',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '60 minutes' },
        { name: 'Database Design', type: 'Online', duration: '45 minutes' },
        { name: 'HR Round', type: 'In-person', duration: '30 minutes' }
      ],
      totalRounds: 3
    }
  },
  {
    title: 'Mobile App Developer',
    description: 'Join our mobile development team to create innovative mobile applications for iOS and Android platforms.',
    companyName: 'MobileFirst Technologies',
    location: 'Mumbai, India',
    jobType: 'Full-time',
    designation: 'Mobile App Developer',
    skillsRequired: ['React Native', 'Flutter', 'JavaScript', 'Mobile Development'],
    eligibility: {
      minCGPA: 6.5,
      allowedCourses: ['Computer Science', 'Information Technology', 'Mobile Development'],
      maxBacklogs: 3,
      yearOfCompletion: [2024, 2025]
    },
    ctc: { min: 8, max: 14, currency: 'LPA' },
    experienceRequired: '0-1 years',
    applicationDeadline: '2025-02-15',
    jobCategory: 'Technical',
    workMode: 'Work from Home',
    applicationCount: 0,
    isActive: true,
    status: 'Approved',
    interviewProcess: {
      rounds: [
        { name: 'Technical Round', type: 'Online', duration: '60 minutes' },
        { name: 'Coding Challenge', type: 'Online', duration: '90 minutes' },
        { name: 'HR Round', type: 'Online', duration: '30 minutes' }
      ],
      totalRounds: 3
    }
  }
];

const updateStudentsWithSkills = async () => {
  try {
    await connectDB();

    // Get all students
    const students = await User.find({ role: 'Student' });
    console.log(`Found ${students.length} students to update`);

    // Update each student with random skills
    for (const student of students) {
      if (student.studentDetails) {
        // Generate 3-6 random skills for each student
        const numSkills = Math.floor(Math.random() * 4) + 3; // 3-6 skills
        const shuffledSkills = [...sampleSkills].sort(() => 0.5 - Math.random());
        const studentSkills = shuffledSkills.slice(0, numSkills);

        student.studentDetails.skills = studentSkills;
        await student.save();
        
        console.log(`Updated ${student.fullName} with skills: ${studentSkills.join(', ')}`);
      }
    }

    console.log('✅ All students updated with skills');

    // Create sample jobs
    console.log('\n📝 Creating sample jobs...');
    
    // Get a recruiter to assign jobs to
    const recruiter = await User.findOne({ role: 'Recruiter' });
    if (!recruiter) {
      console.log('❌ No recruiter found. Please create a recruiter first.');
      return;
    }

    // Get a TnP user to approve jobs
    const tnp = await User.findOne({ role: 'TnP' });
    if (!tnp) {
      console.log('❌ No TnP user found. Please create a TnP user first.');
      return;
    }

    // Create jobs
    for (const jobData of sampleJobs) {
      const job = new Job({
        ...jobData,
        postedBy: recruiter._id,
        approvedBy: tnp._id
      });
      
      await job.save();
      console.log(`Created job: ${job.title} at ${job.companyName}`);
    }

    console.log('✅ Sample jobs created successfully');
    console.log('\n🎉 Recommendation system data setup complete!');
    console.log('\n📊 Summary:');
    console.log(`- Updated ${students.length} students with skills`);
    console.log(`- Created ${sampleJobs.length} sample jobs`);
    console.log('- All jobs are approved and ready for recommendations');

  } catch (error) {
    console.error('Error updating students with skills:', error);
  } finally {
    process.exit(0);
  }
};

updateStudentsWithSkills();
