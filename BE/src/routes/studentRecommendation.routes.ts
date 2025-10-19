import { Router } from 'express';
import * as recommendationController from '../controllers/studentRecommendation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';

const router = Router();

// All routes require authentication and Recruiter/TnP role
router.use(authenticate);

// Get recommended students for a job
router.get(
  '/jobs/:jobId/students',
  authorizeRoles('Recruiter', 'TnP'),
  recommendationController.getRecommendedStudents
);

// Get recommendation statistics for a job
router.get(
  '/jobs/:jobId/stats',
  authorizeRoles('Recruiter', 'TnP'),
  recommendationController.getRecommendationStats
);

export default router;

