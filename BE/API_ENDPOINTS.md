# HireMe Backend API Endpoints

## Base URL: `http://localhost:5000/api`

## Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user (Student/Recruiter/TnP)
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/verify-token` - Verify JWT token
- `PUT /auth/change-password` - Change password

## User Routes (`/users`)
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update profile
- `GET /users/students` - Get all students (TnP only)
- `PUT /users/students/:id/verify` - Verify student (TnP only)
- `DELETE /users/students/:id` - Deactivate student (TnP only)

## Job Routes (`/jobs`)
- `POST /jobs` - Create job (Recruiter only)
- `GET /jobs` - Get all jobs (role-based filtering)
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job (Recruiter only)
- `DELETE /jobs/:id` - Delete job
- `PUT /jobs/:id/approve` - Approve job (TnP only)
- `PUT /jobs/:id/reject` - Reject job (TnP only)

## Application Routes (`/applications`)
- `POST /applications/apply/:jobId` - Apply to job (Student only)
- `GET /applications/my-applications` - Get student's applications
- `GET /applications/job/:jobId` - Get job applicants (Recruiter/TnP)
- `PUT /applications/:applicationId/status` - Update application status (Recruiter)
- `DELETE /applications/:applicationId` - Withdraw application (Student)

## Resume Routes (`/resume`)
- `POST /resume` - Create resume (Student only)
- `GET /resume` - Get own resume (Student only)
- `PUT /resume` - Update resume (Student only)
- `GET /resume/pdf` - Generate PDF (Student only)
- `GET /resume/:studentId` - View student resume (Recruiter/TnP)

## Notification Routes (`/notifications`)
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

## College Routes (`/colleges`)
- `GET /colleges` - Get all colleges

## Analytics Routes (`/analytics`)
- `GET /analytics/dashboard` - Get dashboard stats (role-based)
- `GET /analytics/reports` - Generate reports (TnP only)

## Health Check
- `GET /health` - Server health check

## Authentication
All routes except `/auth/register`, `/auth/login`, `/colleges`, and `/health` require JWT token:
- Header: `Authorization: Bearer <token>`
- Or Cookie: `token=<token>`

## Test Accounts
```
TnP Officer:   tnp@test.com / password123
Student 1:     john@test.com / password123 (Verified)
Student 2:     jane@test.com / password123 (Verified)
Student 3:     mike@test.com / password123 (Not Verified)
Recruiter 1:   recruiter1@test.com / password123
Recruiter 2:   recruiter2@test.com / password123
```

