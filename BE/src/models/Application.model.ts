import mongoose, { Schema, Document } from 'mongoose';

interface IResume {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

interface IInterviewDetails {
  scheduledDate?: Date;
  scheduledTime?: string;
  interviewMode?: 'Online' | 'Offline' | 'Phone';
  meetingLink?: string;
  venue?: string;
  instructions?: string;
  round: number;
}

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Accepted' | 'Rejected';
  resume: IResume;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  interviewDetails?: IInterviewDetails;
  recruiterNotes?: string;
  rejectionReason?: string;
  viewedByRecruiter: boolean;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'],
      default: 'Applied',
    },
    resume: {
      filename: {
        type: String,
        required: [true, 'Resume filename is required'],
      },
      originalName: {
        type: String,
        required: [true, 'Resume original name is required'],
      },
      mimetype: {
        type: String,
        required: [true, 'Resume mimetype is required'],
      },
      size: {
        type: Number,
        required: [true, 'Resume size is required'],
      },
      path: {
        type: String,
        required: [true, 'Resume path is required'],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    interviewDetails: {
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
      },
      interviewMode: {
        type: String,
        enum: ['Online', 'Offline', 'Phone'],
      },
      meetingLink: {
        type: String,
      },
      venue: {
        type: String,
      },
      instructions: {
        type: String,
      },
      round: {
        type: Number,
        default: 1,
      },
    },
    recruiterNotes: {
      type: String,
      maxLength: [1000, 'Recruiter notes cannot exceed 1000 characters'],
    },
    rejectionReason: {
      type: String,
    },
    viewedByRecruiter: {
      type: Boolean,
      default: false,
    },
    viewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;

