import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'Student' | 'TnP' | 'Recruiter';
  title: string;
  message: string;
  type: 'job_posting' | 'application_status' | 'job_approval' | 'job_rejection' | 'general';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  metadata?: {
    jobId?: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    status?: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  role: { 
    type: String, 
    enum: ['Student', 'TnP', 'Recruiter'], 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true, 
    maxLength: 100,
    trim: true
  },
  message: { 
    type: String, 
    required: true, 
    maxLength: 500,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['job_posting', 'application_status', 'job_approval', 'job_rejection', 'general'],
    required: true,
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium',
    index: true
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  metadata: {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    status: String
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  }
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(_doc, ret: any) {
      ret.id = ret._id;
      if (ret._id) delete ret._id;
      if (ret.__v) delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, role: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// TTL index for automatic cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', notificationSchema);