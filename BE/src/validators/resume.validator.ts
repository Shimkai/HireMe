import Joi from 'joi';

export const createResumeSchema = Joi.object({
  personalDetails: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    linkedin: Joi.string().uri(),
    github: Joi.string().uri(),
    portfolio: Joi.string().uri(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string().default('India'),
    }),
  }).required(),
  education: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      field: Joi.string().required(),
      cgpa: Joi.number().min(0).max(10),
      percentage: Joi.number().min(0).max(100),
      yearOfCompletion: Joi.number().required(),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  skills: Joi.object({
    technical: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        proficiency: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert'),
      })
    ),
    soft: Joi.array().items(Joi.string()),
    languages: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        proficiency: Joi.string().valid('Basic', 'Conversational', 'Fluent', 'Native'),
      })
    ),
  }),
  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().max(500).required(),
      techUsed: Joi.array().items(Joi.string()),
      link: Joi.string().uri(),
      githubLink: Joi.string().uri(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      isOngoing: Joi.boolean().default(false),
      teamSize: Joi.number(),
      role: Joi.string(),
    })
  ),
  experience: Joi.array().items(
    Joi.object({
      company: Joi.string().required(),
      role: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      isCurrentJob: Joi.boolean().default(false),
      description: Joi.string().max(1000),
      technologies: Joi.array().items(Joi.string()),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  achievements: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().max(300),
      date: Joi.date(),
      category: Joi.string().valid(
        'Academic',
        'Technical',
        'Sports',
        'Cultural',
        'Leadership',
        'Other'
      ),
    })
  ),
  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      issuingOrganization: Joi.string().required(),
      issueDate: Joi.date(),
      expiryDate: Joi.date(),
      credentialId: Joi.string(),
      credentialUrl: Joi.string().uri(),
    })
  ),
  templateUsed: Joi.string().default('standard'),
  visibility: Joi.object({
    public: Joi.boolean().default(false),
    recruitersOnly: Joi.boolean().default(true),
  }),
});

export const updateResumeSchema = Joi.object({
  personalDetails: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    linkedin: Joi.string().uri(),
    github: Joi.string().uri(),
    portfolio: Joi.string().uri(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string(),
    }),
  }),
  education: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      field: Joi.string().required(),
      cgpa: Joi.number().min(0).max(10),
      percentage: Joi.number().min(0).max(100),
      yearOfCompletion: Joi.number().required(),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  skills: Joi.object({
    technical: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        proficiency: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert'),
      })
    ),
    soft: Joi.array().items(Joi.string()),
    languages: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        proficiency: Joi.string().valid('Basic', 'Conversational', 'Fluent', 'Native'),
      })
    ),
  }),
  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().max(500).required(),
      techUsed: Joi.array().items(Joi.string()),
      link: Joi.string().uri(),
      githubLink: Joi.string().uri(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      isOngoing: Joi.boolean(),
      teamSize: Joi.number(),
      role: Joi.string(),
    })
  ),
  experience: Joi.array().items(
    Joi.object({
      company: Joi.string().required(),
      role: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      isCurrentJob: Joi.boolean(),
      description: Joi.string().max(1000),
      technologies: Joi.array().items(Joi.string()),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  achievements: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().max(300),
      date: Joi.date(),
      category: Joi.string().valid(
        'Academic',
        'Technical',
        'Sports',
        'Cultural',
        'Leadership',
        'Other'
      ),
    })
  ),
  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      issuingOrganization: Joi.string().required(),
      issueDate: Joi.date(),
      expiryDate: Joi.date(),
      credentialId: Joi.string(),
      credentialUrl: Joi.string().uri(),
    })
  ),
  templateUsed: Joi.string(),
  visibility: Joi.object({
    public: Joi.boolean(),
    recruitersOnly: Joi.boolean(),
  }),
}).min(1);

