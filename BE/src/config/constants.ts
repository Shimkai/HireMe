export const USER_ROLES = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  TNP: 'TnP',
} as const;

export const JOB_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
} as const;

export const PLACEMENT_STATUS = {
  PLACED: 'Placed',
  NOT_PLACED: 'Not Placed',
} as const;

export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  INTERNSHIP: 'Internship',
  PART_TIME: 'Part-time',
} as const;

export const NOTIFICATION_TYPES = {
  JOB: 'Job',
  APPLICATION: 'Application',
  SYSTEM: 'System',
  REMINDER: 'Reminder',
} as const;

export const NOTIFICATION_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ACTIVITY_ACTIONS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  JOB_CREATE: 'JOB_CREATE',
  JOB_UPDATE: 'JOB_UPDATE',
  JOB_DELETE: 'JOB_DELETE',
  JOB_APPROVE: 'JOB_APPROVE',
  JOB_REJECT: 'JOB_REJECT',
  APPLICATION_SUBMIT: 'APPLICATION_SUBMIT',
  APPLICATION_UPDATE: 'APPLICATION_UPDATE',
  APPLICATION_WITHDRAW: 'APPLICATION_WITHDRAW',
  RESUME_CREATE: 'RESUME_CREATE',
  RESUME_UPDATE: 'RESUME_UPDATE',
  STUDENT_VERIFY: 'STUDENT_VERIFY',
  STUDENT_UNVERIFY: 'STUDENT_UNVERIFY',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
} as const;

