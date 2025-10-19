/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import User from '../models/User.model';
import { sanitizeUser, getPaginationParams, calculatePagination } from '../utils/helpers';
import ActivityLog from '../models/ActivityLog.model';
import { notifyStudentVerified } from '../services/notification.service';

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
    
    // Merge only the clean data
    user.studentDetails = { ...cleanExistingDetails, ...cleanStudentDetails };
    
    // Explicitly remove undefined nested objects that might cause Mongoose validation errors
    if (user.studentDetails && user.studentDetails.address === undefined) {
      delete user.studentDetails.address;
    }
    if (user.studentDetails && user.studentDetails.tenthMarks === undefined) {
      delete user.studentDetails.tenthMarks;
    }
    if (user.studentDetails && user.studentDetails.twelfthMarks === undefined) {
      delete user.studentDetails.twelfthMarks;
    }
    if (user.studentDetails && user.studentDetails.lastSemesterMarksheet === undefined) {
      delete user.studentDetails.lastSemesterMarksheet;
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
  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

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

  const total = await User.countDocuments(filter);
  const students = await User.find(filter)
    .populate('studentDetails.college')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const sanitized = students.map((s) => sanitizeUser(s));
  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, sanitized, pagination, 'Students fetched successfully');
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
    await notifyStudentVerified((student._id as any).toString());
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

