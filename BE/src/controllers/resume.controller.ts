/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import Resume from '../models/Resume.model';
import ActivityLog from '../models/ActivityLog.model';

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can create resumes');
  }

  // Check if resume already exists
  const existingResume = await Resume.findOne({ studentId: req.user.id });
  if (existingResume) {
    throw ApiError.conflict('Resume already exists. Use update endpoint instead.');
  }

  const resume = await Resume.create({
    ...req.body,
    studentId: req.user.id,
  });

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'RESUME_CREATE',
    entityType: 'Resume',
    entityId: resume._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, resume, 'Resume created successfully', 201);
});

export const getResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can view their resume');
  }

  const resume = await Resume.findOne({ studentId: req.user.id });

  if (!resume) {
    throw ApiError.notFound('Resume not found. Please create one first.');
  }

  ApiSuccess.send(res, resume, 'Resume fetched successfully');
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can update their resume');
  }

  const resume = await Resume.findOne({ studentId: req.user.id });

  if (!resume) {
    throw ApiError.notFound('Resume not found. Please create one first.');
  }

  // Update fields
  Object.assign(resume, req.body);
  resume.lastUpdated = new Date();

  await resume.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'RESUME_UPDATE',
    entityType: 'Resume',
    entityId: resume._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, resume, 'Resume updated successfully');
});

export const getStudentResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  // Only recruiters and TnP can view other students' resumes
  if (req.user.role !== 'Recruiter' && req.user.role !== 'TnP') {
    throw ApiError.forbidden('Access denied');
  }

  const studentId = req.params.studentId;
  const resume = await Resume.findOne({ studentId }).populate('studentId', 'fullName email studentDetails');

  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  // TODO: Add additional access control for recruiters
  // (e.g., only if student has applied to their jobs)

  ApiSuccess.send(res, resume, 'Resume fetched successfully');
});

export const generateResumePDF = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can generate their resume PDF');
  }

  const resume = await Resume.findOne({ studentId: req.user.id });

  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  // TODO: Implement PDF generation logic
  // This would use a library like pdfkit or @react-pdf/renderer
  // For now, return resume data
  ApiSuccess.send(res, { message: 'PDF generation not implemented yet', resume });
});

