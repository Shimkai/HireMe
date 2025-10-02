import mongoose, { Schema, Document } from 'mongoose';

interface IEligibility {
  minCGPA?: number;
  allowedCourses?: string[];
  maxBacklogs?: number;
  yearOfCompletion?: number[];
}

interface ICTC {
  min: number;
  max: number;
  currency: string;
}

interface IInterviewRound {
  type: string;
  description?: string;
  duration?: string;
}

interface IInterviewProcess {
  rounds?: IInterviewRound[];
  totalRounds: number;
}

export interface IJob extends Document {
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Part-time';
  designation: string;
  skillsRequired: string[];
  eligibility: IEligibility;
  ctc: ICTC;
  experienceRequired: 'Fresher' | '0-1 years' | '1-2 years' | '2+ years';
  applicationDeadline: Date;
  postedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected';
  jobCategory?: 'Technical' | 'Non-Technical' | 'Research' | 'Management';
  workMode: 'Work from Office' | 'Work from Home' | 'Hybrid';
  applicationCount: number;
  isActive: boolean;
  rejectionReason?: string;
  interviewProcess: IInterviewProcess;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxLength: [200, 'Job title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxLength: [2000, 'Job description cannot exceed 2000 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Part-time'],
      required: [true, 'Job type is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibility: {
      minCGPA: {
        type: Number,
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10'],
      },
      allowedCourses: [
        {
          type: String,
        },
      ],
      maxBacklogs: {
        type: Number,
        default: 0,
      },
      yearOfCompletion: [
        {
          type: Number,
        },
      ],
    },
    ctc: {
      min: {
        type: Number,
        required: [true, 'Minimum CTC is required'],
        min: [0, 'CTC cannot be negative'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum CTC is required'],
        min: [0, 'CTC cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    experienceRequired: {
      type: String,
      enum: ['Fresher', '0-1 years', '1-2 years', '2+ years'],
      default: 'Fresher',
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by is required'],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    jobCategory: {
      type: String,
      enum: ['Technical', 'Non-Technical', 'Research', 'Management'],
    },
    workMode: {
      type: String,
      enum: ['Work from Office', 'Work from Home', 'Hybrid'],
      default: 'Work from Office',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rejectionReason: {
      type: String,
    },
    interviewProcess: {
      rounds: [
        {
          type: {
            type: String,
          },
          description: String,
          duration: String,
        },
      ],
      totalRounds: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ status: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ 'eligibility.allowedCourses': 1 });

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;

