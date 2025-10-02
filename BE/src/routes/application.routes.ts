import { Router } from 'express';
import * as applicationController from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import { validate } from '../middleware/validation.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateApplicationStatusSchema } from '../validators/application.validator';

const router = Router();

// Student routes
router.post('/apply/:jobId', authenticate, authorizeRoles('Student'), upload.single('resume'), applicationController.applyToJob);
router.get('/my-applications', authenticate, authorizeRoles('Student'), applicationController.getMyApplications);
router.delete('/:applicationId', authenticate, authorizeRoles('Student'), applicationController.withdrawApplication);

// Recruiter/TnP routes
router.get('/job/:jobId', authenticate, applicationController.getJobApplications);
router.put('/:applicationId/status', authenticate, authorizeRoles('Recruiter'), validate(updateApplicationStatusSchema), applicationController.updateApplicationStatus);

export default router;

