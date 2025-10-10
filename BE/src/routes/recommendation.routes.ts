import { Router } from 'express';
import * as recommendationController from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';

const router = Router();

// Get job recommendations for a specific student (for TnP/Admin)
router.get('/student/:studentId', 
  authenticate, 
  authorizeRoles('TnP', 'Admin'), 
  recommendationController.getJobRecommendations
);

// Get job recommendations for the current user (for students)
router.get('/my-recommendations', 
  authenticate, 
  authorizeRoles('Student'), 
  recommendationController.getMyJobRecommendations
);

// Get bulk recommendations for multiple students (for analytics)
router.post('/bulk', 
  authenticate, 
  authorizeRoles('TnP', 'Admin'), 
  recommendationController.getBulkRecommendations
);

export default router;
