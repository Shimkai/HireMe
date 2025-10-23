import Notification from '../models/Notification.model';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import { INotification } from '../models/Notification.model';

export interface CreateNotificationData {
  userId: string;
  role: 'Student' | 'TnP' | 'Recruiter';
  title: string;
  message: string;
  type: 'job_posting' | 'application_status' | 'job_approval' | 'job_rejection' | 'general';
  priority?: 'low' | 'medium' | 'high';
  metadata?: {
    jobId?: string;
    applicationId?: string;
    status?: string;
  };
}

/**
 * NotificationService handles all notification-related business logic
 * including creation, management, and real-time delivery via WebSockets
 */
export class NotificationService {
  /**
   * Creates a single notification and stores it in the database
   * @param data - The notification data to create
   * @returns Promise<INotification> - The created notification
   * @throws Error if notification creation fails
   */
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notification = await Notification.create(data);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Creates notifications for multiple users efficiently
   * @param userIds - Array of user IDs to notify
   * @param role - The role of users to notify
   * @param title - Notification title
   * @param message - Notification message
   * @param type - Type of notification
   * @param priority - Priority level (defaults to 'medium')
   * @param metadata - Additional metadata for the notification
   * @returns Promise<INotification[]> - Array of created notifications
   */
  static async createBulkNotifications(
    userIds: string[],
    role: 'Student' | 'TnP' | 'Recruiter',
    title: string,
    message: string,
    type: 'job_posting' | 'application_status' | 'job_approval' | 'job_rejection' | 'general',
    priority: 'low' | 'medium' | 'high' = 'medium',
    metadata?: any
  ): Promise<INotification[]> {
    try {
      if (!userIds || userIds.length === 0) {
        console.warn('No user IDs provided for bulk notification creation');
        return [];
      }

      const notifications = userIds.map(userId => ({
        userId: userId as any, // Convert string to ObjectId
        role,
        title,
        message,
        type,
        priority,
        metadata
      }));

      return await Notification.insertMany(notifications) as INotification[];
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return [];
    }
  }

  /**
   * Create notification when job is posted (for TnP)
   */
  static async notifyJobPosted(jobId: string, recruiterId: string): Promise<void> {
    try {
      const job = await Job.findById(jobId).populate('postedBy');
      if (!job) {
        console.warn(`Job ${jobId} not found for notification`);
        return;
      }

      const recruiter = await User.findById(recruiterId);
      if (!recruiter) {
        console.warn(`Recruiter ${recruiterId} not found for notification`);
        return;
      }

      // Get all TnP users
      const tnpUsers = await User.find({ role: 'TnP' }).select('_id');
      const tnpUserIds = tnpUsers.map(user => (user._id as any).toString());

      if (tnpUserIds.length === 0) {
        console.warn('No TnP users found for job posted notification');
        return;
      }

      await this.createBulkNotifications(
        tnpUserIds,
        'TnP',
        'New Job Posted',
        `A new job "${job.title}" has been posted by ${recruiter.fullName} and requires your approval.`,
        'job_posting',
        'high',
        { jobId }
      );
    } catch (error) {
      console.error('Error creating job posted notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Create notification when job is approved (for recruiter and students)
   */
  static async notifyJobApproved(jobId: string, _tnpId: string): Promise<void> {
    try {
      const job = await Job.findById(jobId).populate('postedBy');
      if (!job) {
        console.warn(`Job ${jobId} not found for approval notification`);
        return;
      }

      const recruiter = job.postedBy as any;
      if (!recruiter) {
        console.warn(`Recruiter not found for job ${jobId}`);
        return;
      }

      // Notify the recruiter who posted the job
      await this.createNotification({
        userId: recruiter._id.toString(),
        role: 'Recruiter',
        title: 'Job Approved',
        message: `Your job posting "${job.title}" has been approved and is now visible to students.`,
        type: 'job_approval',
        priority: 'high',
        metadata: { jobId }
      });

      // Get all students
      const students = await User.find({ role: 'Student' }).select('_id');
      const studentIds = students.map(user => (user._id as any).toString());

      if (studentIds.length === 0) {
        console.warn('No students found for job approved notification');
        return;
      }

      await this.createBulkNotifications(
        studentIds,
        'Student',
        'New Job Available',
        `A new job "${job.title}" at ${job.companyName} is now available for applications.`,
        'job_posting',
        'high',
        { jobId }
      );
    } catch (error) {
      console.error('Error creating job approved notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Create notification when job is rejected (for recruiter)
   */
  static async notifyJobRejected(jobId: string, recruiterId: string, reason?: string): Promise<void> {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        console.warn(`Job ${jobId} not found for rejection notification`);
        return;
      }

      await this.createNotification({
        userId: recruiterId,
        role: 'Recruiter',
        title: 'Job Rejected',
        message: `Your job posting "${job.title}" has been rejected${reason ? `: ${reason}` : '.'}`,
        type: 'job_rejection',
        priority: 'high',
        metadata: { jobId }
      });
    } catch (error) {
      console.error('Error creating job rejected notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Create notification when student applies for job (for recruiter)
   */
  static async notifyJobApplication(applicationId: string, jobId: string, studentId: string): Promise<void> {
    try {
      const [application, job, student] = await Promise.all([
        Application.findById(applicationId),
        Job.findById(jobId),
        User.findById(studentId)
      ]);

      if (!application) {
        console.warn(`Application ${applicationId} not found for notification`);
        return;
      }
      if (!job) {
        console.warn(`Job ${jobId} not found for application notification`);
        return;
      }
      if (!student) {
        console.warn(`Student ${studentId} not found for application notification`);
        return;
      }

      await this.createNotification({
        userId: job.postedBy.toString(),
        role: 'Recruiter',
        title: 'New Application Received',
        message: `${student.fullName} has applied for your job "${job.title}".`,
        type: 'application_status',
        priority: 'medium',
        metadata: { jobId, applicationId }
      });
    } catch (error) {
      console.error('Error creating job application notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Create notification when application status changes (for student)
   */
  static async notifyApplicationStatusChange(
    applicationId: string,
    studentId: string,
    status: string,
    jobTitle: string
  ): Promise<void> {
    try {
      const priority = status === 'Placed' ? 'high' : 'medium';
      
      await this.createNotification({
        userId: studentId,
        role: 'Student',
        title: 'Application Status Update',
        message: `Your application for "${jobTitle}" has been updated to "${status}".`,
        type: 'application_status',
        priority,
        metadata: { applicationId, status }
      });
    } catch (error) {
      console.error('Error creating application status change notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Create notification when student gets placed (for TnP)
   */
  static async notifyStudentPlaced(studentId: string): Promise<void> {
    try {
      const student = await User.findById(studentId).populate('studentDetails.college');
      if (!student) {
        console.warn(`Student ${studentId} not found for placement notification`);
        return;
      }

      // Get TnP from the same college
      const tnpUsers = await User.find({ 
        role: 'TnP',
        'tnpDetails.college': student.studentDetails?.college
      }).select('_id');

      const tnpUserIds = tnpUsers.map(user => (user._id as any).toString());

      if (tnpUserIds.length === 0) {
        console.warn('No TnP users found for student placement notification');
        return;
      }

      const collegeName = (student.studentDetails?.college as any)?.name || 'Unknown College';
      await this.createBulkNotifications(
        tnpUserIds,
        'TnP',
        'Student Placed',
        `Student ${student.fullName} from ${collegeName} has been marked as 'Placed'.`,
        'application_status',
        'high',
        { status: 'Placed' }
      );
    } catch (error) {
      console.error('Error creating student placed notification:', error);
      // Don't throw - notification failure shouldn't break main flow
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserNotificationStats(userId: string) {
    const stats = await Notification.aggregate([
      { $match: { userId } },
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
          }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, byType: [] };
  }
}

export default NotificationService;