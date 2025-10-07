import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Student Details Interface
interface IStudentDetails {
  courseName?: string;
  college?: mongoose.Types.ObjectId;
  isVerified: boolean;
  placementStatus: 'Placed' | 'Not Placed';
  cgpa?: number;
  yearOfCompletion?: number;
  registrationNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  tenthMarks?: {
    percentage?: number;
    marksheet?: string;
  };
  twelfthMarks?: {
    percentage?: number;
    marksheet?: string;
  };
  lastSemesterMarksheet?: string;
  areaOfInterest?: string[];
}

// Recruiter Details Interface
interface IRecruiterDetails {
  companyName?: string;
  industry?: string;
  designation?: string;
  companyInfo?: string;
  companyWebsite?: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}

// TnP Details Interface
interface ITnpDetails {
  college?: mongoose.Types.ObjectId;
  designation?: string;
  employeeId?: string;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: 'Student' | 'Recruiter' | 'TnP';
  profileAvatar: string;
  isActive: boolean;
  lastLogin?: Date;
  studentDetails?: IStudentDetails;
  recruiterDetails?: IRecruiterDetails;
  tnpDetails?: ITnpDetails;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxLength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['Student', 'Recruiter', 'TnP'],
      required: [true, 'Role is required'],
    },
    profileAvatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    // Student Details
    studentDetails: {
      courseName: {
        type: String,
        required: function (this: IUser) {
          return this.role === 'Student';
        },
      },
      college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
        required: function (this: IUser) {
          return this.role === 'Student';
        },
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      placementStatus: {
        type: String,
        enum: ['Placed', 'Not Placed'],
        default: 'Not Placed',
      },
      cgpa: {
        type: Number,
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10'],
      },
      yearOfCompletion: {
        type: Number,
        min: [2020, 'Year must be 2020 or later'],
        max: [2030, 'Year cannot exceed 2030'],
      },
      registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        country: { type: String, default: 'India' },
      },
      tenthMarks: {
        percentage: { type: Number, min: 0, max: 100 },
        marksheet: { type: String }, // File path
      },
      twelfthMarks: {
        percentage: { type: Number, min: 0, max: 100 },
        marksheet: { type: String }, // File path
      },
      lastSemesterMarksheet: {
        type: String, // File path
      },
      areaOfInterest: [{
        type: String,
        enum: [
          'Backend Development',
          'Frontend Development', 
          'Full-Stack Development',
          'Mobile Development',
          'Data Science',
          'Machine Learning',
          'Artificial Intelligence',
          'DevOps',
          'Cloud Computing',
          'Cybersecurity',
          'Testing/QA',
          'UI/UX Design',
          'Database Administration',
          'System Administration',
          'Network Engineering',
          'Software Architecture',
          'Product Management',
          'Business Analysis',
          'Digital Marketing',
          'Content Writing',
          'Graphic Design',
          'Video Editing',
          'Photography',
          'Other'
        ],
        trim: true,
      }],
    },

    // Recruiter Details
    recruiterDetails: {
      companyName: {
        type: String,
        required: function (this: IUser) {
          return this.role === 'Recruiter';
        },
      },
      industry: {
        type: String,
        required: function (this: IUser) {
          return this.role === 'Recruiter';
        },
      },
      designation: {
        type: String,
        required: function (this: IUser) {
          return this.role === 'Recruiter';
        },
      },
      companyInfo: {
        type: String,
        maxLength: [1000, 'Company info cannot exceed 1000 characters'],
      },
      companyWebsite: {
        type: String,
      },
      verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Verified', // Recruiters are automatically verified
      },
    },

    // TnP Details
    tnpDetails: {
      college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
        required: function (this: IUser) {
          return this.role === 'TnP';
        },
      },
      designation: {
        type: String,
        required: function (this: IUser) {
          return this.role === 'TnP';
        },
      },
      employeeId: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studentDetails.college': 1 });
userSchema.index({ 'tnpDetails.college': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

