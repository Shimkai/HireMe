import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import { getPaginationParams, calculatePagination } from '../utils/helpers';
import ActivityLog from '../models/ActivityLog.model';
import { notifyJobApproved, notifyJobRejected } from '../services/notification.service';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Recruiter') {
    throw ApiError.forbidden('Only recruiters can create jobs');
  }

  const jobData = {
    ...req.body,
    postedBy: req.user.id,
  };

  const job = await Job.create(jobData);

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'JOB_CREATE',
    entityType: 'Job',
    entityId: job._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, job, 'Job created successfully. Pending approval.', 201);
});

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

  // Build filter based on role
  const filter: any = { isActive: true };

  if (req.user.role === 'Student') {
    // Students see only approved jobs with valid deadlines
    filter.status = 'Approved';
    filter.applicationDeadline = { $gte: new Date() };
  } else if (req.user.role === 'Recruiter') {
    // Recruiters see only their own jobs
    filter.postedBy = req.user.id;
  }
  // TnP sees all jobs

  // Additional filters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.jobType) {
    filter.jobType = req.query.jobType;
  }
  if (req.query.location) {
    filter.location = { $regex: req.query.location, $options: 'i' };
  }
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { companyName: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate('postedBy', 'fullName email recruiterDetails')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, jobs, pagination, 'Jobs fetched successfully');
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'fullName email recruiterDetails')
    .populate('approvedBy', 'fullName');

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Access control
  if (req.user.role === 'Student' && (job.status !== 'Approved' || !job.isActive)) {
    throw ApiError.forbidden('This job is not available');
  }

  if (req.user.role === 'Recruiter' && job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only view your own jobs');
  }

  ApiSuccess.send(res, job, 'Job fetched successfully');
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'Recruiter') {
    throw ApiError.forbidden('Only recruiters can update jobs');
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only update your own jobs');
  }

  if (job.status === 'Approved') {
    throw ApiError.badRequest('Cannot update approved jobs');
  }

  Object.assign(job, req.body);
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'JOB_UPDATE',
    entityType: 'Job',
    entityId: job._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, job, 'Job updated successfully');
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Check permissions
  if (req.user.role === 'Recruiter' && job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only delete your own jobs');
  }

  // Check if there are applications
  const applicationCount = await Application.countDocuments({ jobId: job._id });
  if (applicationCount > 0) {
    throw ApiError.badRequest('Cannot delete job with existing applications');
  }

  job.isActive = false;
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'JOB_DELETE',
    entityType: 'Job',
    entityId: job._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, null, 'Job deleted successfully');
});

export const approveJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Only TnP officers can approve jobs');
  }

  const job = await Job.findById(req.params.id).populate('postedBy');

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.status !== 'Pending') {
    throw ApiError.badRequest('Only pending jobs can be approved');
  }

  job.status = 'Approved';
  job.approvedBy = req.user.id as any;
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'JOB_APPROVE',
    entityType: 'Job',
    entityId: job._id,
    details: { approvalNotes: req.body.approvalNotes },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Notify recruiter
  await notifyJobApproved((job.postedBy as any)._id.toString(), job.title, (job._id as any).toString());

  ApiSuccess.send(res, job, 'Job approved successfully');
});

export const rejectJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Only TnP officers can reject jobs');
  }

  const job = await Job.findById(req.params.id).populate('postedBy');

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.status !== 'Pending') {
    throw ApiError.badRequest('Only pending jobs can be rejected');
  }

  job.status = 'Rejected';
  job.rejectionReason = req.body.rejectionReason;
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'JOB_REJECT',
    entityType: 'Job',
    entityId: job._id,
    details: { rejectionReason: req.body.rejectionReason },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Notify recruiter
  await notifyJobRejected(
    (job.postedBy as any)._id.toString(),
    job.title,
    req.body.rejectionReason,
    (job._id as any).toString()
  );

  ApiSuccess.send(res, job, 'Job rejected');
});

