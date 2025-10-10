import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { recommendationService } from '../services/recommendation.service';

export const getJobRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { studentId } = req.params;
  const { limit = 6 } = req.query;

  const recommendations = await recommendationService.getJobRecommendations(
    studentId,
    parseInt(limit as string)
  );

  ApiSuccess.send(res, recommendations, 'Job recommendations fetched successfully');
});

export const getMyJobRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 6 } = req.query;

  if (!req.user?.id) {
    res.status(401).json({
      success: false,
      error: {
        message: 'User not authenticated',
        code: 'UNAUTHORIZED'
      }
    });
    return;
  }

  const recommendations = await recommendationService.getJobRecommendations(
    req.user.id,
    parseInt(limit as string)
  );

  ApiSuccess.send(res, recommendations, 'Your job recommendations fetched successfully');
});

export const getBulkRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { studentIds } = req.body;
  const { limit = 6 } = req.query;

  if (!Array.isArray(studentIds)) {
    res.status(400).json({
      success: false,
      error: {
        message: 'studentIds must be an array',
        code: 'BAD_REQUEST'
      }
    });
    return;
  }

  const recommendations = await recommendationService.getBulkRecommendations(
    studentIds,
    parseInt(limit as string)
  );

  ApiSuccess.send(res, recommendations, 'Bulk job recommendations fetched successfully');
});
