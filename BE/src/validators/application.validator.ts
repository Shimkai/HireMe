import Joi from 'joi';

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Accepted', 'Rejected', 'Withdrawn')
    .required(),
  recruiterNotes: Joi.string().max(1000).allow('', null),
  rejectionReason: Joi.string().max(500).allow('', null),
  shortlistedAt: Joi.alternatives().try(Joi.date(), Joi.string(), Joi.any()).allow(null),
  offeredAt: Joi.alternatives().try(Joi.date(), Joi.string(), Joi.any()).allow(null),
  interviewDetails: Joi.object({
    scheduledDate: Joi.alternatives().try(Joi.date(), Joi.string(), Joi.any()).allow(null),
    scheduledTime: Joi.string().allow('', null),
    interviewMode: Joi.string().valid('Online', 'Offline', 'Phone').allow('', null),
    meetingLink: Joi.alternatives().try(
      Joi.string().uri(),
      Joi.string().allow('', null)
    ),
    venue: Joi.string().allow('', null),
    instructions: Joi.string().allow('', null),
    round: Joi.number().min(1).default(1).allow(null),
  }),
});

