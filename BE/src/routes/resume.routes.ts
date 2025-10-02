import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import { validate } from '../middleware/validation.middleware';
import { createResumeSchema, updateResumeSchema } from '../validators/resume.validator';

const router = Router();

// Student routes
router.post('/', authenticate, authorizeRoles('Student'), validate(createResumeSchema), resumeController.createResume);
router.get('/', authenticate, authorizeRoles('Student'), resumeController.getResume);
router.put('/', authenticate, authorizeRoles('Student'), validate(updateResumeSchema), resumeController.updateResume);
router.get('/pdf', authenticate, authorizeRoles('Student'), resumeController.generateResumePDF);

// Recruiter/TnP routes
router.get('/:studentId', authenticate, resumeController.getStudentResume);

export default router;

