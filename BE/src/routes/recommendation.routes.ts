import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import {
  getRecommendedStudents,
  shortlistStudent,
  placeStudent,
} from '../controllers/recommendation.controller';

const router = Router();

// Get recommended students for a job
router.get(
  '/job/:jobId',
  authenticate,
  authorizeRoles('Recruiter', 'TnP'),
  getRecommendedStudents
);

// Shortlist a student
router.post(
  '/shortlist',
  authenticate,
  authorizeRoles('Recruiter', 'TnP'),
  shortlistStudent
);

// Place a student
router.post(
  '/place',
  authenticate,
  authorizeRoles('Recruiter', 'TnP'),
  placeStudent
);

export default router;

