import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().max(100).optional(),
  mobileNumber: Joi.string().pattern(/^\d{10}$/).optional(),
  profileAvatar: Joi.string().allow('').optional(),
  studentDetails: Joi.object({
    courseName: Joi.string().optional(),
    college: Joi.string().optional(),
    cgpa: Joi.number().min(0).max(10).optional(),
    yearOfCompletion: Joi.number().min(2020).max(2030).optional(),
    registrationNumber: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().allow('').optional(),
      city: Joi.string().allow('').optional(),
      state: Joi.string().allow('').optional(),
      pincode: Joi.string().allow('').optional(),
      country: Joi.string().allow('').optional(),
    }).optional(),
    tenthMarks: Joi.object({
      percentage: Joi.alternatives().try(
        Joi.number().min(0).max(100),
        Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value, helpers) => {
          const num = parseFloat(value);
          if (isNaN(num) || num < 0 || num > 100) {
            return helpers.error('number.invalid');
          }
          return num;
        })
      ).allow('').optional(),
      marksheet: Joi.string().allow('').optional(),
    }).optional(),
    twelfthMarks: Joi.object({
      percentage: Joi.alternatives().try(
        Joi.number().min(0).max(100),
        Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value, helpers) => {
          const num = parseFloat(value);
          if (isNaN(num) || num < 0 || num > 100) {
            return helpers.error('number.invalid');
          }
          return num;
        })
      ).allow('').optional(),
      marksheet: Joi.string().allow('').optional(),
    }).optional(),
    lastSemesterMarksheet: Joi.string().allow('').optional(),
    areaOfInterest: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  recruiterDetails: Joi.object({
    companyName: Joi.string().optional(),
    industry: Joi.string().optional(),
    designation: Joi.string().optional(),
    companyInfo: Joi.string().max(1000).optional(),
    companyWebsite: Joi.string().uri().allow('').optional(),
  }).optional(),
  tnpDetails: Joi.object({
    designation: Joi.string().optional(),
    employeeId: Joi.string().optional(),
  }).optional(),
}).unknown(true);

export const verifyStudentSchema = Joi.object({
  isVerified: Joi.boolean().required(),
  reason: Joi.string().max(500),
});

