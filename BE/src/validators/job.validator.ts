import Joi from 'joi';

export const createJobSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(2000).required(),
  companyName: Joi.string().trim().required(),
  location: Joi.string().required(),
  jobType: Joi.string().valid('Full-time', 'Internship', 'Part-time').required(),
  designation: Joi.string().required(),
  skillsRequired: Joi.array().items(Joi.string()),
  eligibility: Joi.object({
    minCGPA: Joi.number().min(0).max(10),
    allowedCourses: Joi.array().items(Joi.string()),
    maxBacklogs: Joi.number().min(0),
    yearOfCompletion: Joi.array().items(Joi.number()),
  }),
  ctc: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(0).required(),
    currency: Joi.string().default('INR'),
  }).required(),
  experienceRequired: Joi.string()
    .valid('Fresher', '0-1 years', '1-2 years', '2+ years')
    .default('Fresher'),
  applicationDeadline: Joi.date().greater('now').required(),
  jobCategory: Joi.string().valid('Technical', 'Non-Technical', 'Research', 'Management'),
  workMode: Joi.string()
    .valid('Work from Office', 'Work from Home', 'Hybrid')
    .default('Work from Office'),
  interviewProcess: Joi.object({
    rounds: Joi.array().items(
      Joi.object({
        type: Joi.string(),
        description: Joi.string(),
        duration: Joi.string(),
      })
    ),
    totalRounds: Joi.number().min(1).default(1),
  }),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().max(200),
  description: Joi.string().max(2000),
  companyName: Joi.string().trim(),
  location: Joi.string(),
  jobType: Joi.string().valid('Full-time', 'Internship', 'Part-time'),
  designation: Joi.string(),
  skillsRequired: Joi.array().items(Joi.string()),
  eligibility: Joi.object({
    minCGPA: Joi.number().min(0).max(10),
    allowedCourses: Joi.array().items(Joi.string()),
    maxBacklogs: Joi.number().min(0),
    yearOfCompletion: Joi.array().items(Joi.number()),
  }),
  ctc: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string(),
  }),
  experienceRequired: Joi.string().valid('Fresher', '0-1 years', '1-2 years', '2+ years'),
  applicationDeadline: Joi.date().greater('now'),
  jobCategory: Joi.string().valid('Technical', 'Non-Technical', 'Research', 'Management'),
  workMode: Joi.string().valid('Work from Office', 'Work from Home', 'Hybrid'),
  interviewProcess: Joi.object({
    rounds: Joi.array().items(
      Joi.object({
        type: Joi.string(),
        description: Joi.string(),
        duration: Joi.string(),
      })
    ),
    totalRounds: Joi.number().min(1),
  }),
}).min(1);

export const approveJobSchema = Joi.object({
  approvalNotes: Joi.string().max(500),
});

export const rejectJobSchema = Joi.object({
  rejectionReason: Joi.string().max(500).required(),
});

