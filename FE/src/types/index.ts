export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Student' | 'Recruiter' | 'TnP';
  profileAvatar?: string;
  isActive: boolean;
  studentDetails?: StudentDetails;
  recruiterDetails?: RecruiterDetails;
  tnpDetails?: TnPDetails;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetails {
  courseName: string;
  college: string | College;
  isVerified: boolean;
  placementStatus: 'Placed' | 'Not Placed';
  cgpa?: number;
  yearOfCompletion?: number;
  registrationNumber?: string;
}

export interface RecruiterDetails {
  companyName: string;
  industry: string;
  designation: string;
  companyInfo?: string;
  companyWebsite?: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}

export interface TnPDetails {
  college: string | College;
  designation: string;
  employeeId?: string;
}

export interface College {
  _id: string;
  name: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Part-time';
  designation: string;
  skillsRequired: string[];
  eligibility: {
    minCGPA?: number;
    allowedCourses?: string[];
    maxBacklogs?: number;
    yearOfCompletion?: number[];
  };
  ctc: {
    min: number;
    max: number;
    currency: string;
  };
  experienceRequired: string;
  applicationDeadline: string;
  postedBy: string | User;
  approvedBy?: string | User;
  status: 'Pending' | 'Approved' | 'Rejected';
  jobCategory?: string;
  workMode: string;
  applicationCount: number;
  isActive: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  jobId: string | Job;
  studentId: string | User;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Accepted' | 'Rejected';
  resume: {
    filename: string;
    originalName: string;
    path: string;
  };
  appliedAt: string;
  interviewDetails?: {
    scheduledDate?: string;
    scheduledTime?: string;
    interviewMode?: string;
    meetingLink?: string;
    venue?: string;
    instructions?: string;
  };
  recruiterNotes?: string;
  rejectionReason?: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'Job' | 'Application' | 'System' | 'Reminder';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  [key: string]: any;
}

