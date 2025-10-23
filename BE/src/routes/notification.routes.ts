import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { notificationValidator } from '../validators/notification.validator';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats
} from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get user's notifications with pagination and filtering
router.get('/', getNotifications);

// Get unread notification count for badge
router.get('/unread-count', getUnreadCount);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark specific notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', deleteNotification);

// Create notification (admin/internal use)
router.post('/', 
  validate(notificationValidator.createNotification),
  createNotification
);

export default router;