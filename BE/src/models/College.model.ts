import mongoose, { Schema, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      unique: true,
      trim: true,
      maxLength: [200, 'College name cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
collegeSchema.index({ name: 1 });

const College = mongoose.model<ICollege>('College', collegeSchema);

export default College;

