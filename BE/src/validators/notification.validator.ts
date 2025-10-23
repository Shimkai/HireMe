import Joi from 'joi';

export const notificationValidator = {
  createNotification: Joi.object({
    userId: Joi.string().required(),
    role: Joi.string().valid('Student', 'TnP', 'Recruiter').required(),
    title: Joi.string().max(100).required(),
    message: Joi.string().max(500).required(),
    type: Joi.string().valid('job_posting', 'application_status', 'job_approval', 'job_rejection', 'general').required(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    metadata: Joi.object({
      jobId: Joi.string().optional(),
      applicationId: Joi.string().optional(),
      status: Joi.string().optional()
    }).optional()
  }),

  markAsRead: Joi.object({
    notificationId: Joi.string().required()
  }),

  getNotifications: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    type: Joi.string().valid('job_posting', 'application_status', 'job_approval', 'job_rejection', 'general').optional(),
    isRead: Joi.boolean().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional()
  })
};
