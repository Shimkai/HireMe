import Joi from 'joi';

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected')
    .required(),
  recruiterNotes: Joi.string().max(1000),
  rejectionReason: Joi.string().max(500),
  interviewDetails: Joi.object({
    scheduledDate: Joi.date(),
    scheduledTime: Joi.string(),
    interviewMode: Joi.string().valid('Online', 'Offline', 'Phone'),
    meetingLink: Joi.string().uri(),
    venue: Joi.string(),
    instructions: Joi.string(),
    round: Joi.number().min(1).default(1),
  }),
});

