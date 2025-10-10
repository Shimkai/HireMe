import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';

const router = Router();

// All report routes require authentication and TnP role
router.use(authenticate);
router.use(authorizeRoles('TnP'));

router.get('/report', reportController.getReportData);
router.get('/report/pdf/:reportType', reportController.downloadReportPDF);

export default router;
