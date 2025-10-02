import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import { validate } from '../middleware/validation.middleware';
import { createJobSchema, updateJobSchema, approveJobSchema, rejectJobSchema } from '../validators/job.validator';

const router = Router();

router.post('/', authenticate, authorizeRoles('Recruiter'), validate(createJobSchema), jobController.createJob);
router.get('/', authenticate, jobController.getAllJobs);
router.get('/:id', authenticate, jobController.getJobById);
router.put('/:id', authenticate, authorizeRoles('Recruiter'), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);

// TnP approval routes
router.put('/:id/approve', authenticate, authorizeRoles('TnP'), validate(approveJobSchema), jobController.approveJob);
router.put('/:id/reject', authenticate, authorizeRoles('TnP'), validate(rejectJobSchema), jobController.rejectJob);

export default router;

