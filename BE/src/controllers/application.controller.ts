import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import Application from '../models/Application.model';
import Job from '../models/Job.model';
import User from '../models/User.model';
import { getPaginationParams, calculatePagination } from '../utils/helpers';
import ActivityLog from '../models/ActivityLog.model';
import { notifyNewApplication, notifyApplicationStatusUpdate } from '../services/notification.service';

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can apply to jobs');
  }

  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Validations
  if (job.status !== 'Approved') {
    throw ApiError.badRequest('Job is not approved yet');
  }

  if (!job.isActive) {
    throw ApiError.badRequest('Job is no longer active');
  }

  if (new Date(job.applicationDeadline) < new Date()) {
    throw ApiError.badRequest('Application deadline has passed');
  }

  // Check student verification
  const student = await User.findById(req.user.id);
  if (!student?.studentDetails?.isVerified) {
    throw ApiError.forbidden('Your account must be verified by TnP to apply for jobs');
  }

  // Check placement status
  if (student.studentDetails?.placementStatus === 'Placed') {
    throw ApiError.forbidden('Placed students cannot apply for new jobs');
  }

  // Check if already applied
  const existingApplication = await Application.findOne({ jobId, studentId: req.user.id });
  if (existingApplication) {
    throw ApiError.conflict('You have already applied to this job');
  }

  // Check resume file
  if (!req.file) {
    throw ApiError.badRequest('Resume file is required');
  }

  // Create application
  const application = await Application.create({
    jobId,
    studentId: req.user.id,
    resume: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
  });

  // Increment job application count
  job.applicationCount += 1;
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'APPLICATION_SUBMIT',
    entityType: 'Application',
    entityId: application._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Notify recruiter
  await notifyNewApplication(
    job.postedBy.toString(),
    student.fullName,
    job.title,
    (application._id as any).toString()
  );

  ApiSuccess.send(res, application, 'Application submitted successfully', 201);
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can view their applications');
  }

  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const filter: any = { studentId: req.user.id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('jobId')
    .skip(skip)
    .limit(limit)
    .sort({ appliedAt: -1 });

  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, applications, pagination, 'Applications fetched successfully');
});

export const getJobApplications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Access control
  if (req.user.role === 'Recruiter' && job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only view applications for your own jobs');
  }

  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const filter: any = { jobId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('studentId', 'fullName email studentDetails')
    .skip(skip)
    .limit(limit)
    .sort({ appliedAt: -1 });

  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, applications, pagination, 'Applications fetched successfully');
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Recruiter') {
    throw ApiError.forbidden('Only recruiters can update application status');
  }

  const applicationId = req.params.applicationId;
  const application = await Application.findById(applicationId).populate('jobId studentId');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const job = application.jobId as any;

  // Verify recruiter owns this job
  if (job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only update applications for your own jobs');
  }

  const { status, recruiterNotes, rejectionReason, interviewDetails } = req.body;

  application.status = status;
  application.reviewedAt = new Date();
  application.reviewedBy = req.user.id as any;

  if (recruiterNotes) {
    application.recruiterNotes = recruiterNotes;
  }

  if (rejectionReason) {
    application.rejectionReason = rejectionReason;
  }

  if (interviewDetails) {
    application.interviewDetails = interviewDetails;
  }

  if (!application.viewedByRecruiter) {
    application.viewedByRecruiter = true;
    application.viewedAt = new Date();
  }

  await application.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'APPLICATION_UPDATE',
    entityType: 'Application',
    entityId: application._id,
    details: { status, recruiterNotes },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Notify student
  const student = application.studentId as any;
  await notifyApplicationStatusUpdate(
    student._id.toString(),
    job.title,
    status,
    (application._id as any).toString()
  );

  ApiSuccess.send(res, application, 'Application status updated successfully');
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Student') {
    throw ApiError.forbidden('Only students can withdraw their applications');
  }

  const applicationId = req.params.applicationId;
  const application = await Application.findOne({
    _id: applicationId,
    studentId: req.user.id,
  });

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.status !== 'Applied') {
    throw ApiError.badRequest('Only applications with "Applied" status can be withdrawn');
  }

  await Application.findByIdAndDelete(applicationId);

  // Decrement job application count
  await Job.findByIdAndUpdate(application.jobId, { $inc: { applicationCount: -1 } });

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'APPLICATION_WITHDRAW',
    entityType: 'Application',
    entityId: application._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, null, 'Application withdrawn successfully');
});

