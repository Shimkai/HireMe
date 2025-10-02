import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';

const router = Router();

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);
router.get('/reports', authenticate, authorizeRoles('TnP'), analyticsController.getReports);

export default router;

