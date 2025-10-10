import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import resumeRoutes from './resume.routes';
import notificationRoutes from './notification.routes';
import collegeRoutes from './college.routes';
import analyticsRoutes from './analytics.routes';
import reportRoutes from './report.routes';
import recommendationRoutes from './recommendation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/resume', resumeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/colleges', collegeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/analytics', reportRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;

