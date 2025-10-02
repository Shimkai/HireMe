import mongoose, { Schema, Document } from 'mongoose';

interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
}

interface IPersonalDetails {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  address?: IAddress;
}

interface IEducation {
  degree: string;
  institution: string;
  field: string;
  cgpa?: number;
  percentage?: number;
  yearOfCompletion: number;
  achievements?: string[];
}

interface ITechnicalSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface ISkills {
  technical?: ITechnicalSkill[];
  soft?: string[];
  languages?: ILanguage[];
}

interface IProject {
  title: string;
  description: string;
  techUsed?: string[];
  link?: string;
  githubLink?: string;
  startDate?: Date;
  endDate?: Date;
  isOngoing: boolean;
  teamSize?: number;
  role?: string;
}

interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  isCurrentJob: boolean;
  description?: string;
  technologies?: string[];
  achievements?: string[];
}

interface IAchievement {
  title: string;
  description?: string;
  date?: Date;
  category: 'Academic' | 'Technical' | 'Sports' | 'Cultural' | 'Leadership' | 'Other';
}

interface ICertification {
  name: string;
  issuingOrganization: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

interface IVisibility {
  public: boolean;
  recruitersOnly: boolean;
}

export interface IResume extends Document {
  studentId: mongoose.Types.ObjectId;
  personalDetails: IPersonalDetails;
  education: IEducation[];
  skills: ISkills;
  projects: IProject[];
  experience: IExperience[];
  achievements: IAchievement[];
  certifications: ICertification[];
  isComplete: boolean;
  lastUpdated: Date;
  templateUsed: string;
  visibility: IVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: [true, 'Student ID is required'],
    },
    personalDetails: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone is required'],
      },
      linkedin: String,
      github: String,
      portfolio: String,
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
          type: String,
          default: 'India',
        },
      },
    },
    education: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        field: {
          type: String,
          required: true,
        },
        cgpa: {
          type: Number,
          min: 0,
          max: 10,
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        yearOfCompletion: {
          type: Number,
          required: true,
        },
        achievements: [String],
      },
    ],
    skills: {
      technical: [
        {
          name: String,
          proficiency: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          },
        },
      ],
      soft: [String],
      languages: [
        {
          name: String,
          proficiency: {
            type: String,
            enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
          },
        },
      ],
    },
    projects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
          maxLength: 500,
        },
        techUsed: [String],
        link: String,
        githubLink: String,
        startDate: Date,
        endDate: Date,
        isOngoing: {
          type: Boolean,
          default: false,
        },
        teamSize: Number,
        role: String,
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date,
        isCurrentJob: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 1000,
        },
        technologies: [String],
        achievements: [String],
      },
    ],
    achievements: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          maxLength: 300,
        },
        date: Date,
        category: {
          type: String,
          enum: ['Academic', 'Technical', 'Sports', 'Cultural', 'Leadership', 'Other'],
        },
      },
    ],
    certifications: [
      {
        name: {
          type: String,
          required: true,
        },
        issuingOrganization: {
          type: String,
          required: true,
        },
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    isComplete: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    templateUsed: {
      type: String,
      default: 'standard',
    },
    visibility: {
      public: {
        type: Boolean,
        default: false,
      },
      recruitersOnly: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index
resumeSchema.index({ studentId: 1 });

const Resume = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;

