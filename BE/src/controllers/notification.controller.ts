/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import Notification from '../models/Notification.model';
import { getPaginationParams, calculatePagination } from '../utils/helpers';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { page, limit, skip } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const filter: any = { recipient: req.user.id };

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = calculatePagination(total, page, limit);

  ApiSuccess.sendWithPagination(res, notifications, pagination, 'Notifications fetched successfully');
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const notificationId = req.params.id;
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user.id,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  ApiSuccess.send(res, notification, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  ApiSuccess.send(res, null, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const notificationId = req.params.id;
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user.id,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  ApiSuccess.send(res, null, 'Notification deleted successfully');
});

