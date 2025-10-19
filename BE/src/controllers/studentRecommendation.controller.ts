import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import * as recommendationService from '../services/studentRecommendation.service';
import Job from '../models/Job.model';

/**
 * @desc    Get recommended students for a job
 * @route   GET /api/recommendations/jobs/:jobId/students
 * @access  Private (Recruiter)
 */
export const getRecommendedStudents = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { limit, minScore } = req.query;

  // Verify job exists and belongs to the recruiter
  const job = await Job.findById(jobId);
  
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Check if the user is the owner of the job
  if (req.user?.role === 'Recruiter' && job.postedBy.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('You can only view recommendations for your own jobs');
  }

  const options = {
    limit: limit ? parseInt(limit as string) : 10,
    minScore: minScore ? parseFloat(minScore as string) : 0
  };

  const recommendations = await recommendationService.getRecommendedStudentsForJob(
    jobId,
    options
  );

  res.status(200).json({
    success: true,
    data: recommendations,
    message: 'Recommended students fetched successfully'
  });
});

/**
 * @desc    Get recommendation statistics for a job
 * @route   GET /api/recommendations/jobs/:jobId/stats
 * @access  Private (Recruiter)
 */
export const getRecommendationStats = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  // Verify job exists and belongs to the recruiter
  const job = await Job.findById(jobId);
  
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Check if the user is the owner of the job
  if (req.user?.role === 'Recruiter' && job.postedBy.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('You can only view statistics for your own jobs');
  }

  const stats = await recommendationService.getRecommendationStats(jobId);

  res.status(200).json({
    success: true,
    data: stats,
    message: 'Recommendation statistics fetched successfully'
  });
});

export default {
  getRecommendedStudents,
  getRecommendationStats
};

