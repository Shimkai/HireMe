import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().max(100),
  mobileNumber: Joi.string().pattern(/^\d{10}$/),
  profileAvatar: Joi.string(),
  studentDetails: Joi.object({
    courseName: Joi.string(),
    cgpa: Joi.number().min(0).max(10),
    yearOfCompletion: Joi.number().min(2020).max(2030),
    registrationNumber: Joi.string(),
  }),
  recruiterDetails: Joi.object({
    companyName: Joi.string(),
    industry: Joi.string(),
    designation: Joi.string(),
    companyInfo: Joi.string().max(1000),
    companyWebsite: Joi.string().uri(),
  }),
  tnpDetails: Joi.object({
    designation: Joi.string(),
    employeeId: Joi.string(),
  }),
}).min(1);

export const verifyStudentSchema = Joi.object({
  isVerified: Joi.boolean().required(),
  reason: Joi.string().max(500),
});

