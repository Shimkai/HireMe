/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import * as analyticsService from '../services/analytics.service';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  let stats;

  switch (req.user.role) {
    case 'Student':
      stats = await analyticsService.getStudentDashboardStats(req.user.id);
      break;
    case 'Recruiter':
      stats = await analyticsService.getRecruiterDashboardStats(req.user.id);
      break;
    case 'TnP':
      stats = await analyticsService.getTnPDashboardStats(req.user.id);
      break;
    default:
      throw ApiError.badRequest('Invalid user role');
  }

  ApiSuccess.send(res, stats, 'Dashboard stats fetched successfully');
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'TnP') {
    throw ApiError.forbidden('Only TnP officers can generate reports');
  }

  // Get TnP user to find college
  const User = (await import('../models/User.model')).default;
  const tnpUser = await User.findById(req.user.id);
  
  if (!tnpUser || !tnpUser.tnpDetails?.college) {
    throw ApiError.notFound('TnP college information not found');
  }

  const collegeId = tnpUser.tnpDetails.college.toString();
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  const report = await analyticsService.getPlacementReports(collegeId, startDate, endDate);

  ApiSuccess.send(res, report, 'Placement report generated successfully');
});

