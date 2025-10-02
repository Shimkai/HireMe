import Notification, { INotification } from '../models/Notification.model';
import { logger } from '../utils/logger';

interface CreateNotificationData {
  recipient: string;
  title: string;
  message: string;
  type: 'Job' | 'Application' | 'System' | 'Reminder';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  link?: string;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    senderId?: string;
  };
}

export const createNotification = async (data: CreateNotificationData): Promise<INotification> => {
  try {
    const notification = await Notification.create({
      ...data,
      deliveryStatus: 'Delivered',
      deliveredAt: new Date(),
    });
    logger.info(`Notification created for user ${data.recipient}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    throw error;
  }
};

export const createBulkNotifications = async (
  recipients: string[],
  data: Omit<CreateNotificationData, 'recipient'>
): Promise<void> => {
  try {
    const notifications = recipients.map((recipient) => ({
      ...data,
      recipient,
      deliveryStatus: 'Delivered',
      deliveredAt: new Date(),
    }));
    await Notification.insertMany(notifications);
    logger.info(`Bulk notifications created for ${recipients.length} users`);
  } catch (error) {
    logger.error('Failed to create bulk notifications:', error);
    throw error;
  }
};

export const notifyJobApproved = async (recruiterId: string, jobTitle: string, jobId: string) => {
  await createNotification({
    recipient: recruiterId,
    title: 'Job Approved',
    message: `Your job posting "${jobTitle}" has been approved and is now visible to students.`,
    type: 'Job',
    priority: 'High',
    link: `/jobs/${jobId}`,
    metadata: { jobId },
  });
};

export const notifyJobRejected = async (
  recruiterId: string,
  jobTitle: string,
  reason: string,
  jobId: string
) => {
  await createNotification({
    recipient: recruiterId,
    title: 'Job Rejected',
    message: `Your job posting "${jobTitle}" was rejected. Reason: ${reason}`,
    type: 'Job',
    priority: 'High',
    link: `/jobs/${jobId}`,
    metadata: { jobId },
  });
};

export const notifyNewApplication = async (
  recruiterId: string,
  studentName: string,
  jobTitle: string,
  applicationId: string
) => {
  await createNotification({
    recipient: recruiterId,
    title: 'New Application Received',
    message: `${studentName} applied for ${jobTitle}`,
    type: 'Application',
    priority: 'Medium',
    link: `/applications/${applicationId}`,
    metadata: { applicationId },
  });
};

export const notifyApplicationStatusUpdate = async (
  studentId: string,
  jobTitle: string,
  status: string,
  applicationId: string
) => {
  await createNotification({
    recipient: studentId,
    title: 'Application Status Updated',
    message: `Your application for ${jobTitle} has been updated to: ${status}`,
    type: 'Application',
    priority: 'High',
    link: `/applications/${applicationId}`,
    metadata: { applicationId },
  });
};

export const notifyStudentVerified = async (studentId: string) => {
  await createNotification({
    recipient: studentId,
    title: 'Account Verified',
    message: 'Your student account has been verified. You can now apply for jobs.',
    type: 'System',
    priority: 'High',
  });
};

