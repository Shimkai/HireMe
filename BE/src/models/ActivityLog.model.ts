import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action:
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'USER_REGISTER'
    | 'JOB_CREATE'
    | 'JOB_UPDATE'
    | 'JOB_DELETE'
    | 'JOB_APPROVE'
    | 'JOB_REJECT'
    | 'APPLICATION_SUBMIT'
    | 'APPLICATION_UPDATE'
    | 'APPLICATION_WITHDRAW'
    | 'RESUME_CREATE'
    | 'RESUME_UPDATE'
    | 'STUDENT_VERIFY'
    | 'STUDENT_UNVERIFY'
    | 'PROFILE_UPDATE'
    | 'PASSWORD_CHANGE';
  entityType?: 'User' | 'Job' | 'Application' | 'Resume' | 'Notification';
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTER',
        'JOB_CREATE',
        'JOB_UPDATE',
        'JOB_DELETE',
        'JOB_APPROVE',
        'JOB_REJECT',
        'APPLICATION_SUBMIT',
        'APPLICATION_UPDATE',
        'APPLICATION_WITHDRAW',
        'RESUME_CREATE',
        'RESUME_UPDATE',
        'STUDENT_VERIFY',
        'STUDENT_UNVERIFY',
        'PROFILE_UPDATE',
        'PASSWORD_CHANGE',
      ],
    },
    entityType: {
      type: String,
      enum: ['User', 'Job', 'Application', 'Resume', 'Notification'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

// Indexes
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;

