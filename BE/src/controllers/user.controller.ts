/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import User from '../models/User.model';
import { sanitizeUser, calculatePagination } from '../utils/helpers';
import ActivityLog from '../models/ActivityLog.model';
import { NotificationService } from '../services/notification.service';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import { generateStudentsExcel } from '../utils/excelExporter';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const user = await User.findById(req.user.id)
    .populate('studentDetails.college')
    .populate('tnpDetails.college');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiSuccess.send(res, sanitizeUser(user), 'Profile fetched successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  console.log('Update profile request body:', JSON.stringify(req.body, null, 2));
  console.log('Request body studentDetails:', JSON.stringify(req.body.studentDetails, null, 2));

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  console.log('Existing user studentDetails:', JSON.stringify(user.studentDetails, null, 2));

  // Update allowed fields based on role
  const allowedUpdates = ['fullName', 'mobileNumber', 'profileAvatar'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      (user as any)[field] = req.body[field];
    }
  });

  // Update role-specific details
  if (req.body.studentDetails && user.role === 'Student') {
    console.log('Before update - user.studentDetails:', user.studentDetails);
    // Initialize studentDetails if it doesn't exist
    if (!user.studentDetails) {
      user.studentDetails = {
        isVerified: false,
        placementStatus: 'Not Placed'
      };
    }
    
    // Set default college if not specified
    if (!req.body.studentDetails.college && !user.studentDetails.college) {
      const College = require('../models/College.model').default;
      const defaultCollege = await College.findOne({ name: 'G. H. Raisoni College of Engineering and Management, Pune' });
      if (defaultCollege) {
        req.body.studentDetails.college = defaultCollege._id.toString();
        console.log('Set default college for student:', defaultCollege.name);
      }
    }
    
    // Clean undefined values from nested objects before merging
    const cleanStudentDetails: any = {};
    Object.keys(req.body.studentDetails).forEach(key => {
      const value = req.body.studentDetails[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanStudentDetails[key] = value;
      }
    });
    
    // Also clean existing studentDetails to remove undefined nested objects
    const cleanExistingDetails: any = {};
    if (user.studentDetails) {
      Object.keys(user.studentDetails).forEach(key => {
        const value = (user.studentDetails as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          // Additional check for nested objects
          if (typeof value === 'object' && value !== null) {
            // Check if it's an empty object or has undefined values
            const hasValidValues = Object.values(value).some(v => v !== undefined && v !== null && v !== '');
            if (hasValidValues) {
              cleanExistingDetails[key] = value;
            }
          } else {
            cleanExistingDetails[key] = value;
          }
        }
      });
    }
    
    // Merge only the clean data, but preserve file paths if they exist in the database
    user.studentDetails = { ...cleanExistingDetails, ...cleanStudentDetails };
    
    // Preserve marksheet paths if they exist in the database but weren't explicitly updated
    if (user.studentDetails) {
      if (cleanExistingDetails.tenthMarks?.marksheet && !cleanStudentDetails.tenthMarks?.marksheet) {
        user.studentDetails.tenthMarks = {
          ...user.studentDetails.tenthMarks,
          ...cleanExistingDetails.tenthMarks,
        };
      }
      if (cleanExistingDetails.twelfthMarks?.marksheet && !cleanStudentDetails.twelfthMarks?.marksheet) {
        user.studentDetails.twelfthMarks = {
          ...user.studentDetails.twelfthMarks,
          ...cleanExistingDetails.twelfthMarks,
        };
      }
      if (cleanExistingDetails.lastSemesterMarksheet && !cleanStudentDetails.lastSemesterMarksheet) {
        user.studentDetails.lastSemesterMarksheet = cleanExistingDetails.lastSemesterMarksheet;
      }
      if (cleanExistingDetails.resume && !cleanStudentDetails.resume) {
        (user.studentDetails as any).resume = cleanExistingDetails.resume;
      }
    }
    
    // Explicitly remove undefined nested objects that might cause Mongoose validation errors
    if (user.studentDetails && user.studentDetails.address === undefined) {
      delete user.studentDetails.address;
    }
    
    // Automatically set student as unverified when profile is updated
    // This requires TnP verification again
    if (user.studentDetails) {
      user.studentDetails.isVerified = false;
    }
    
    console.log('After update - user.studentDetails:', user.studentDetails);
    console.log('Final studentDetails before save:', JSON.stringify(user.studentDetails, null, 2));
  }
  if (req.body.recruiterDetails && user.role === 'Recruiter') {
    user.recruiterDetails = { ...user.recruiterDetails, ...req.body.recruiterDetails };
  }
  if (req.body.tnpDetails && user.role === 'TnP') {
    user.tnpDetails = { ...user.tnpDetails, ...req.body.tnpDetails };
  }

  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Fetch updated user with populated references
  const updatedUser = await User.findById(req.user.id)
    .populate('studentDetails.college')
    .populate('tnpDetails.college');

  console.log('Updated user from database:', JSON.stringify(updatedUser?.studentDetails, null, 2));

  ApiSuccess.send(res, sanitizeUser(updatedUser), 'Profile updated successfully');
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  console.log('Upload details:', {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    fieldname: req.file.fieldname
  });

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update profile avatar
  user.profileAvatar = `/uploads/avatars/${req.file.filename}`;
  
  // If user is a student, set as unverified when avatar is changed
  if (user.role === 'Student' && user.studentDetails) {
    user.studentDetails.isVerified = false;
  }
  
  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Fetch updated user with populated references
  const updatedUser = await User.findById(req.user.id)
    .populate('studentDetails.college')
    .populate('tnpDetails.college');

  ApiSuccess.send(res, { profileAvatar: updatedUser?.profileAvatar }, 'Avatar uploaded successfully');
});

export const uploadTenthMarksheet = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update tenth marksheet
  if (!user.studentDetails) {
    user.studentDetails = {
      isVerified: false,
      placementStatus: 'Not Placed',
      tenthMarks: {}
    };
  }
  user.studentDetails.tenthMarks = {
    ...user.studentDetails.tenthMarks,
    marksheet: `/uploads/marksheets/${req.file.filename}`,
  };
  
  // Set student as unverified when marksheet is uploaded
  user.studentDetails.isVerified = false;
  
  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, { tenthMarks: user.studentDetails.tenthMarks }, 'Tenth marksheet uploaded successfully');
});

export const uploadTwelfthMarksheet = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update twelfth marksheet
  if (!user.studentDetails) {
    user.studentDetails = {
      isVerified: false,
      placementStatus: 'Not Placed',
      twelfthMarks: {}
    };
  }
  user.studentDetails.twelfthMarks = {
    ...user.studentDetails.twelfthMarks,
    marksheet: `/uploads/marksheets/${req.file.filename}`,
  };
  
  // Set student as unverified when marksheet is uploaded
  user.studentDetails.isVerified = false;
  
  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, { twelfthMarks: user.studentDetails.twelfthMarks }, 'Twelfth marksheet uploaded successfully');
});

export const uploadLastSemesterMarksheet = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update last semester marksheet
  if (!user.studentDetails) {
    user.studentDetails = {
      isVerified: false,
      placementStatus: 'Not Placed'
    };
  }
  user.studentDetails.lastSemesterMarksheet = `/uploads/marksheets/${req.file.filename}`;
  
  // Set student as unverified when marksheet is uploaded
  user.studentDetails.isVerified = false;
  
  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, { lastSemesterMarksheet: user.studentDetails.lastSemesterMarksheet }, 'Last semester marksheet uploaded successfully');
});

export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can upload resumes');
  }

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.studentDetails) {
    throw ApiError.badRequest('Student details not found');
  }

  // Add resume field to studentDetails
  (user.studentDetails as any).resume = `/uploads/resumes/${req.file.filename}`;
  
  // Set student as unverified when resume is uploaded
  user.studentDetails.isVerified = false;
  
  await user.save();

  // Log the activity
  await ActivityLog.create({
    userId: user._id,
    action: 'RESUME_UPLOAD',
    details: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, { resume: (user.studentDetails as any).resume }, 'Resume uploaded successfully');
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!req.file) {
    throw ApiError.badRequest('No avatar file provided');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update profile avatar with the uploaded file path
  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  user.profileAvatar = avatarPath;
  await user.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'AVATAR_UPDATE',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, sanitizeUser(user), 'Avatar updated successfully');
});

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const tnpUser = await User.findById(req.user.id);
  if (!tnpUser) {
    throw ApiError.notFound('User not found');
  }

  const collegeId = tnpUser.tnpDetails?.college;

  // Build filter
  const filter: any = {
    role: 'Student',
    'studentDetails.college': collegeId,
  };

  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.course) {
    filter['studentDetails.courseName'] = req.query.course;
  }

  if (req.query.verified !== undefined) {
    filter['studentDetails.isVerified'] = req.query.verified === 'true';
  }

  if (req.query.placement) {
    filter['studentDetails.placementStatus'] = req.query.placement;
  }

  // Fetch full list of students for this college (no pagination limit)
  const students = await User.find(filter)
    .populate('studentDetails.college')
    .sort({ createdAt: -1 });

  const total = students.length;
  const sanitized = students.map((s) => sanitizeUser(s));

  // Keep pagination shape for compatibility, but represent the full list
  const pagination = calculatePagination(total, 1, total || 1);

  ApiSuccess.sendWithPagination(res, sanitized, pagination, 'Students fetched successfully');
});

export const exportStudents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const tnpUser = await User.findById(req.user.id);
  if (!tnpUser) {
    throw ApiError.notFound('User not found');
  }

  const collegeId = tnpUser.tnpDetails?.college;

  // Base filter: all students of this college
  const filter: any = {
    role: 'Student',
    'studentDetails.college': collegeId,
  };

  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.course) {
    filter['studentDetails.courseName'] = req.query.course;
  }

  if (req.query.verified !== undefined && req.query.verified !== '') {
    filter['studentDetails.isVerified'] = req.query.verified === 'true';
  }

  if (req.query.placement) {
    filter['studentDetails.placementStatus'] = req.query.placement;
  }

  // Export-specific filters
  const exportFilterType = (req.query.exportFilterType as string) || 'all';
  const exportVerification = req.query.exportVerification as string | undefined;
  const exportPlacement = req.query.exportPlacement as string | undefined;
  const exportCourses =
    typeof req.query.exportCourses === 'string'
      ? (req.query.exportCourses as string).split(',').filter(Boolean)
      : undefined;

  if (exportFilterType === 'verification' && exportVerification) {
    filter['studentDetails.isVerified'] = exportVerification === 'Verified';
  } else if (exportFilterType === 'placement' && exportPlacement) {
    filter['studentDetails.placementStatus'] = exportPlacement;
  } else if (exportFilterType === 'course' && exportCourses && exportCourses.length > 0) {
    filter['studentDetails.courseName'] = { $in: exportCourses };
  }

  const students = await User.find(filter).populate('studentDetails.college').sort({ createdAt: -1 });

  const includeAcademic = req.query.exportWithAcademic === 'true';
  const includeSkills = req.query.exportIncludeSkills === 'true';

  const rows = students.map((student) => {
    const s: any = student;
    const details: any = s.studentDetails || {};
    const college =
      typeof details.college === 'object' && details.college
        ? details.college.name
        : details.college || 'N/A';

    const placementStatus = details.placementStatus || 'Not Placed';
    const companyName =
      placementStatus === 'Placed' ? (details.placementCompany || 'Not specified') : '';

    const row: any = {
      id: details.registrationNumber || s._id.toString(),
      name: s.fullName || 'N/A',
      email: s.email || 'N/A',
      branch: details.courseName || 'N/A',
      college,
      verificationStatus: details.isVerified ? 'Verified' : 'Unverified',
      placementStatus,
      companyName,
    };

    if (includeAcademic) {
      row.graduationYear = details.yearOfCompletion ?? null;
      row.cgpa = details.cgpa ?? null;
      row.tenthPercentage = details.tenthMarks?.percentage ?? null;
      row.twelfthPercentage = details.twelfthMarks?.percentage ?? null;
    }

    if (includeSkills) {
      row.skills = Array.isArray(details.skills) ? details.skills.join(', ') : '';
    }

    return row;
  });

  const stream = await generateStudentsExcel(rows, {
    includeAcademic,
    includeSkills,
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `student-records-${timestamp}.xlsx`;

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  stream.pipe(res);
});

export const verifyStudent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const { isVerified } = req.body;
  const studentId = req.params.id;

  const student = await User.findOne({ _id: studentId, role: 'Student' });
  if (!student) {
    throw ApiError.notFound('Student not found');
  }

  // Verify TnP has access to this student's college
  const tnpUser = await User.findById(req.user.id);
  if (
    !tnpUser ||
    student.studentDetails?.college?.toString() !== tnpUser.tnpDetails?.college?.toString()
  ) {
    throw ApiError.forbidden('You can only verify students from your college');
  }

  if (student.studentDetails) {
    student.studentDetails.isVerified = isVerified;
  }
  await student.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: isVerified ? 'STUDENT_VERIFY' : 'STUDENT_UNVERIFY',
    entityType: 'User',
    entityId: student._id,
    details: { reason: req.body.reason },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Send notification
  if (isVerified) {
    // Create a general notification for student verification
    await NotificationService.createNotification({
      userId: (student._id as any).toString(),
      role: 'Student',
      title: 'Account Verified!',
      message: 'Your account has been verified by the TnP officer. You can now apply for jobs!',
      type: 'general',
      priority: 'high'
    });
  }

  ApiSuccess.send(res, sanitizeUser(student), `Student ${isVerified ? 'verified' : 'unverified'} successfully`);
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const studentId = req.params.id;
  const student = await User.findOne({ _id: studentId, role: 'Student' });

  if (!student) {
    throw ApiError.notFound('Student not found');
  }

  // Verify TnP has access to this student's college
  const tnpUser = await User.findById(req.user.id);
  if (
    !tnpUser ||
    student.studentDetails?.college?.toString() !== tnpUser.tnpDetails?.college?.toString()
  ) {
    throw ApiError.forbidden('You can only manage students from your college');
  }

  // Soft delete
  student.isActive = false;
  await student.save();

  ApiSuccess.send(res, null, 'Student account deactivated successfully');
});

export const getTnPStatistics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const tnpUser = await User.findById(req.user.id);
  if (!tnpUser) {
    throw ApiError.notFound('User not found');
  }

  const collegeId = tnpUser.tnpDetails?.college;

  // Total Students: Count students from the same college
  const totalStudents = await User.countDocuments({
    role: 'Student',
    'studentDetails.college': collegeId,
  });

  // Active Jobs: Count approved jobs
  const activeJobs = await Job.countDocuments({
    status: 'Approved',
    isActive: true,
  });

  // Pending Approvals: Count pending jobs
  const pendingApprovals = await Job.countDocuments({
    status: 'Pending',
  });

  ApiSuccess.send(
    res,
    {
      totalStudents,
      activeJobs,
      pendingApprovals,
    },
    'Statistics fetched successfully'
  );
});

export const getRecruiterStatistics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Recruiter') {
    throw ApiError.forbidden('Access denied');
  }

  const recruiterId = req.user.id;

  // Get all jobs posted by this recruiter
  const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
  const jobIds = recruiterJobs.map(job => job._id);

  // Active Jobs: Count approved and active jobs posted by this recruiter
  const activeJobs = await Job.countDocuments({
    postedBy: recruiterId,
    status: 'Approved',
    isActive: true,
  });

  // Total Applications: Count all applications to recruiter's jobs
  const totalApplications = await Application.countDocuments({
    jobId: { $in: jobIds },
  });

  // Interviews Scheduled: Count applications with status 'Interview Scheduled'
  const interviewsScheduled = await Application.countDocuments({
    jobId: { $in: jobIds },
    status: 'Interview Scheduled',
  });

  // Hired Candidates: Count applications with status 'Accepted' or 'Offered'
  const hiredCandidates = await Application.countDocuments({
    jobId: { $in: jobIds },
    status: { $in: ['Accepted', 'Offered'] },
  });

  ApiSuccess.send(
    res,
    {
      activeJobs,
      totalApplications,
      interviewsScheduled,
      hiredCandidates,
    },
    'Statistics fetched successfully'
  );
});

