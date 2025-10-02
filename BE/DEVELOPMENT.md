# HireMe Backend - Development Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd BE
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hireme
JWT_SECRET=your-secret-key-min-32-characters
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB
```bash
# Using Docker
docker-compose up -d

# Or start local MongoDB
mongod --dbpath /path/to/db
```

### 4. Seed Database
```bash
# Seed colleges (50+ Indian colleges)
npm run seed:colleges

# Seed test data (users, jobs, etc.)
npm run seed:test
```

### 5. Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run seed:colleges` - Seed colleges
- `npm run seed:test` - Seed test data

## Project Structure

```
BE/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers (8 files)
│   ├── middleware/     # Express middleware (7 files)
│   ├── models/         # Mongoose schemas (7 files)
│   ├── routes/         # API routes (9 files)
│   ├── services/       # Business logic (5 files)
│   ├── utils/          # Utility functions (6 files)
│   ├── validators/     # Joi schemas (5 files)
│   ├── types/          # TypeScript types
│   ├── seeders/        # Database seeders
│   ├── uploads/        # File uploads
│   └── server.ts       # Entry point
├── logs/               # Application logs
├── dist/               # Compiled JavaScript
└── node_modules/       # Dependencies
```

## API Testing

### Using curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","mobileNumber":"1234567890","password":"password123","role":"Student","studentDetails":{"courseName":"CS","college":"collegeId"}}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Get profile (with token)
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <your-token>"
```

### Using Postman/Insomnia
Import the API endpoints and test all routes with proper authentication.

## Database Models

1. **College** - College information
2. **User** - Users with role-based details (Student/Recruiter/TnP)
3. **Job** - Job postings with eligibility criteria
4. **Application** - Job applications with resume
5. **Resume** - Multi-section resume builder
6. **Notification** - User notifications
7. **ActivityLog** - Audit trail

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student/Recruiter/TnP)
- Password hashing with bcrypt
- Token expiry and refresh

### File Upload
- Resume upload (PDF only, max 5MB)
- Avatar upload (images only)
- Stored in `src/uploads/`

### Validation
- Joi schema validation for all requests
- Mongoose schema validation
- Custom error messages

### Logging
- Winston logger for all operations
- Request/response logging
- Error logging with stack traces
- Logs stored in `logs/` directory

### Error Handling
- Centralized error handler
- Custom API error classes
- Consistent error response format
- MongoDB error handling

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Auth rate limiting (5 attempts/15min)
- Input sanitization

## Common Operations

### Create a Student
1. Register with role "Student"
2. TnP verifies the student
3. Student can now apply to jobs

### Post a Job
1. Recruiter registers and logs in
2. Creates job posting (status: Pending)
3. TnP approves the job
4. Students can now apply

### Apply to a Job
1. Student must be verified
2. Upload resume (PDF)
3. Application created
4. Recruiter receives notification

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### JWT Token Invalid
- Check `JWT_SECRET` length (min 32 chars)
- Verify token format in Authorization header
- Check token expiry

### File Upload Error
- Ensure `uploads/` directory exists
- Check file size (max 5MB)
- Verify file type (PDF for resumes)

### Build Errors
- Run `npm run lint:fix`
- Check TypeScript configuration
- Ensure all dependencies installed

## Next Steps

1. Implement email notifications
2. Add PDF generation for resumes
3. Implement advanced analytics
4. Add Elasticsearch for job search
5. Implement caching with Redis
6. Add comprehensive testing
7. Deploy to production

