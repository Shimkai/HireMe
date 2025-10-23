import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import Notification from '../models/Notification.model';
import { getPaginationParams, calculatePagination } from '../utils/helpers';
// import { sanitizeUser } from '../utils/helpers'; // Not used in this controller

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { page, limit, skip } = getPaginationParams(req as any);
  const { type, isRead, priority } = req.query;

  // Build filter object
  const filter: any = { userId: req.user.id };
  
  if (type) filter.type = type;
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (priority) filter.priority = priority;

  // Get notifications with pagination
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('metadata.jobId', 'title companyName')
    .populate('metadata.applicationId', 'status appliedAt');

  const total = await Notification.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  ApiSuccess.send(res, {
    notifications,
    pagination
  }, 'Notifications fetched successfully');
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const count = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false
  });

  ApiSuccess.send(res, { unreadCount: count }, 'Unread count fetched successfully');
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { notificationId } = req.params as { notificationId: string };

  const notification = await Notification.findOneAndUpdate(
    { 
      _id: notificationId, 
      userId: req.user.id 
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  ApiSuccess.send(res, notification, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const result = await Notification.updateMany(
    { 
      userId: req.user.id,
      isRead: false 
    },
    { isRead: true }
  );

  ApiSuccess.send(res, { 
    modifiedCount: result.modifiedCount 
  }, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { notificationId } = req.params as { notificationId: string };

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId: req.user.id
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  ApiSuccess.send(res, null, 'Notification deleted successfully');
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role, title, message, type, priority = 'medium', metadata } = req.body;

  const notification = await Notification.create({
    userId,
    role,
    title,
    message,
    type,
    priority,
    metadata
  });

  ApiSuccess.send(res, notification, 'Notification created successfully', 201);
});

export const getNotificationStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const stats = await Notification.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } },
        byType: {
          $push: {
            type: '$type',
            isRead: '$isRead'
          }
        },
        byPriority: {
          $push: {
            priority: '$priority',
            isRead: '$isRead'
          }
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, unread: 0, byType: [], byPriority: [] };

  // Process type and priority breakdowns
  const typeBreakdown = result.byType.reduce((acc: any, item: any) => {
    if (!acc[item.type]) {
      acc[item.type] = { total: 0, unread: 0 };
    }
    acc[item.type].total++;
    if (!item.isRead) acc[item.type].unread++;
    return acc;
  }, {});

  const priorityBreakdown = result.byPriority.reduce((acc: any, item: any) => {
    if (!acc[item.priority]) {
      acc[item.priority] = { total: 0, unread: 0 };
    }
    acc[item.priority].total++;
    if (!item.isRead) acc[item.priority].unread++;
    return acc;
  }, {});

  ApiSuccess.send(res, {
    total: result.total,
    unread: result.unread,
    read: result.total - result.unread,
    typeBreakdown,
    priorityBreakdown
  }, 'Notification stats fetched successfully');
});