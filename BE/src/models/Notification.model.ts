import mongoose, { Schema, Document } from 'mongoose';

interface IMetadata {
  jobId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'Job' | 'Application' | 'System' | 'Reminder';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isRead: boolean;
  readAt?: Date;
  link?: string;
  metadata?: IMetadata;
  deliveryStatus: 'Pending' | 'Delivered' | 'Failed';
  deliveredAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxLength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxLength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['Job', 'Application', 'System', 'Reminder'],
      required: [true, 'Type is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    link: {
      type: String,
    },
    metadata: {
      jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
      applicationId: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
      },
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Delivered', 'Failed'],
      default: 'Pending',
    },
    deliveredAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;

