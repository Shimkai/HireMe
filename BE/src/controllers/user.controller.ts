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

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update allowed fields based on role
  const allowedUpdates = ['fullName', 'mobileNumber', 'profileAvatar'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      (user as any)[field] = req.body[field];
    }
  });

  // Update role-specific details
  if (req.body.studentDetails && user.role === 'Student') {
    user.studentDetails = { ...user.studentDetails, ...req.body.studentDetails };
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

  ApiSuccess.send(res, sanitizeUser(user), 'Profile updated successfully');
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

