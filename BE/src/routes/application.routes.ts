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

// Recruiter/TnP routes
// More specific routes must come first to avoid route conflicts
router.get('/my-job-applications/export', authenticate, authorizeRoles('Recruiter'), applicationController.exportMyJobApplications);
router.get('/my-job-applications', authenticate, authorizeRoles('Recruiter'), applicationController.getMyJobApplications);
router.get('/job/:jobId', authenticate, applicationController.getJobApplications);
router.get('/recruiter', authenticate, authorizeRoles('Recruiter'), applicationController.getRecruiterApplications);
router.get('/all', authenticate, authorizeRoles('TnP'), applicationController.getAllApplications);

// Routes with parameters should come after specific routes
router.put('/:applicationId/status', authenticate, authorizeRoles('Recruiter'), validate(updateApplicationStatusSchema), applicationController.updateApplicationStatus);
router.delete('/:applicationId', authenticate, authorizeRoles('Student'), applicationController.withdrawApplication);

// Test link route
router.post('/job/:jobId/send-test-link', authenticate, authorizeRoles('Recruiter', 'TnP'), applicationController.sendTestLink);

export default router;

