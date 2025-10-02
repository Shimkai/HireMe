import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.max': 'Full name cannot exceed 100 characters',
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  mobileNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  role: Joi.string().valid('Student', 'Recruiter', 'TnP').required().messages({
    'any.only': 'Role must be Student, Recruiter, or TnP',
    'string.empty': 'Role is required',
  }),
  // Student details
  studentDetails: Joi.when('role', {
    is: 'Student',
    then: Joi.object({
      courseName: Joi.string().required(),
      college: Joi.string().required(),
      cgpa: Joi.number().min(0).max(10),
      yearOfCompletion: Joi.number().min(2020).max(2030),
      registrationNumber: Joi.string(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  // Recruiter details
  recruiterDetails: Joi.when('role', {
    is: 'Recruiter',
    then: Joi.object({
      companyName: Joi.string().required(),
      industry: Joi.string().required(),
      designation: Joi.string().required(),
      companyInfo: Joi.string().max(1000),
      companyWebsite: Joi.string().uri(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  // TnP details
  tnpDetails: Joi.when('role', {
    is: 'TnP',
    then: Joi.object({
      college: Joi.string().required(),
      designation: Joi.string().required(),
      employeeId: Joi.string(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters',
  }),
});

