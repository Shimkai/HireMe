import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import { ApiError } from '../utils/apiError';

export const getStudentDashboardStats = async (userId: string) => {
  const applicationsCount = await Application.countDocuments({ studentId: userId });
  const interviewScheduled = await Application.countDocuments({
    studentId: userId,
    status: 'Interview Scheduled',
  });
  const shortlisted = await Application.countDocuments({
    studentId: userId,
    status: 'Shortlisted',
  });
  const accepted = await Application.countDocuments({
    studentId: userId,
    status: 'Accepted',
  });

  const user = await User.findById(userId);
  const placementStatus = user?.studentDetails?.placementStatus || 'Not Placed';

  return {
    applicationsCount,
    interviewScheduled,
    shortlisted,
    accepted,
    placementStatus,
  };
};

export const getRecruiterDashboardStats = async (userId: string) => {
  const jobsPosted = await Job.countDocuments({ postedBy: userId });
  const activeJobs = await Job.countDocuments({ postedBy: userId, isActive: true, status: 'Approved' });
  const pendingJobs = await Job.countDocuments({ postedBy: userId, status: 'Pending' });
  
  // Get all job IDs posted by recruiter
  const jobs = await Job.find({ postedBy: userId }).select('_id');
  const jobIds = jobs.map(job => job._id);
  
  const applicationsReceived = await Application.countDocuments({ jobId: { $in: jobIds } });
  const shortlisted = await Application.countDocuments({
    jobId: { $in: jobIds },
    status: 'Shortlisted',
  });

  return {
    jobsPosted,
    activeJobs,
    pendingJobs,
    applicationsReceived,
    shortlisted,
  };
};

export const getTnPDashboardStats = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const collegeId = user.tnpDetails?.college;

  const totalStudents = await User.countDocuments({
    role: 'Student',
    'studentDetails.college': collegeId,
  });
  const verifiedStudents = await User.countDocuments({
    role: 'Student',
    'studentDetails.college': collegeId,
    'studentDetails.isVerified': true,
  });
  const placedStudents = await User.countDocuments({
    role: 'Student',
    'studentDetails.college': collegeId,
    'studentDetails.placementStatus': 'Placed',
  });

  const pendingJobs = await Job.countDocuments({ status: 'Pending' });
  const approvedJobs = await Job.countDocuments({ status: 'Approved', isActive: true });

  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : '0';

  return {
    totalStudents,
    verifiedStudents,
    placedStudents,
    placementRate,
    pendingJobs,
    approvedJobs,
  };
};

export const getPlacementReports = async (collegeId: string, startDate?: Date, endDate?: Date) => {
  const dateFilter: any = { 'studentDetails.college': collegeId };
  
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: startDate, $lte: endDate };
  }

  const students = await User.find({ role: 'Student', ...dateFilter })
    .populate('studentDetails.college')
    .lean();

  const placedStudents = students.filter(
    (s: any) => s.studentDetails?.placementStatus === 'Placed'
  );

  // Get course-wise breakdown
  const courseWiseStats: any = {};
  students.forEach((student: any) => {
    const course = student.studentDetails?.courseName || 'Unknown';
    if (!courseWiseStats[course]) {
      courseWiseStats[course] = { total: 0, placed: 0 };
    }
    courseWiseStats[course].total++;
    if (student.studentDetails?.placementStatus === 'Placed') {
      courseWiseStats[course].placed++;
    }
  });

  return {
    totalStudents: students.length,
    placedStudents: placedStudents.length,
    placementRate: students.length > 0 ? ((placedStudents.length / students.length) * 100).toFixed(2) : '0',
    courseWiseStats,
  };
};

