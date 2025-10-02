# 🚀 HireMe Platform - Complete Implementation Plan

## Project Overview

**HireMe** is a desktop-only job placement platform for campus placements supporting three roles:

- **Student**: Apply for jobs, build resumes, track applications
- **Recruiter**: Post jobs, review applications, shortlist candidates
- **TnP (Training & Placement Officer)**: Approve jobs, verify students, manage placements

## Technology Stack

**Backend:**

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- File Upload with Multer
- Validation with Joi
- Logging with Winston

**Frontend:**

- React 18 + TypeScript
- Vite Build Tool
- Material-UI v5
- Redux Toolkit + RTK Query
- React Router v6
- React Hook Form
- @react-pdf/renderer

**Design System:**

- Font: Ubuntu (Google Fonts)
- Primary Color: Light Purple (#A78BFA)
- Desktop Only: 1024px - 1920px

**Development Environment:**

- Using Cursor IDE for development
- No documentation files during initial development
- No test files during initial development
- No README files during initial development
- Focus on core functionality first

---

## PHASE 1: PROJECT INITIALIZATION

### Step 1: Create Root Folder Structure

Create the following folder structure in `\Hire-Me`:

```
Hire-Me/
├── BE/                    # Backend application
├── FE/                    # Frontend application
├── .gitignore            # Root gitignore
└── docker-compose.yml    # Docker configuration (optional)
```

**Tasks:**

- [ ] Create BE/ folder
- [ ] Create FE/ folder
- [ ] Create root .gitignore with:

  ```
  # Dependencies
  node_modules/

  # Environment
  .env
  .env.local
  .env.*.local

  # Build outputs
  dist/
  build/

  # Logs
  logs/
  *.log
  npm-debug.log*

  # Uploads
  uploads/

  # IDE
  .vscode/
  .idea/
  *.suo
  *.ntvs*
  *.njsproj
  *.sln
  *.sw?

  # OS
  .DS_Store
  Thumbs.db
  ```

---

## PHASE 2: BACKEND SETUP

### Step 2: Initialize Backend Project

Navigate to `BE/` folder and create the complete backend structure.

**Backend Folder Structure:**

```
BE/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── models/
│   │   ├── College.model.ts
│   │   ├── User.model.ts
│   │   ├── Job.model.ts
│   │   ├── Application.model.ts
│   │   ├── Resume.model.ts
│   │   ├── Notification.model.ts
│   │   └── ActivityLog.model.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── job.controller.ts
│   │   ├── application.controller.ts
│   │   ├── resume.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── college.controller.ts
│   │   └── analytics.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── job.routes.ts
│   │   ├── application.routes.ts
│   │   ├── resume.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── college.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── roleCheck.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── logger.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── job.validator.ts
│   │   ├── application.validator.ts
│   │   └── resume.validator.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── notification.service.ts
│   │   ├── file.service.ts
│   │   └── analytics.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── asyncHandler.ts
│   │   ├── apiResponse.ts
│   │   ├── apiError.ts
│   │   ├── jwt.ts
│   │   ├── encryption.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── user.types.ts
│   │   ├── job.types.ts
│   │   └── common.types.ts
│   ├── seeders/
│   │   ├── college.seeder.ts
│   │   └── testData.seeder.ts
│   ├── uploads/
│   │   ├── resumes/
│   │   └── avatars/
│   └── server.ts
├── logs/
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── nodemon.json
└── package.json
```

**Tasks:**

- [ ] Create all folders in BE/src/
- [ ] Create logs/ folder
- [ ] Create package.json with dependencies
- [ ] Create tsconfig.json
- [ ] Create .env.example
- [ ] Create .eslintrc.json
- [ ] Create .prettierrc
- [ ] Create nodemon.json
- [ ] Create .gitignore

---

### Step 3: Create Backend Configuration Files

#### 3.1 package.json

```json
{
  "name": "hireme-backend",
  "version": "1.0.0",
  "description": "HireMe Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "seed:colleges": "ts-node src/seeders/college.seeder.ts",
    "seed:test": "ts-node src/seeders/testData.seeder.ts"
  },
  "keywords": ["placement", "jobs", "recruitment"],
  "author": "viresh3104",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "multer": "^1.4.5-lts.1",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "cookie-parser": "^1.4.6",
    "express-async-handler": "^1.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "@types/cookie-parser": "^1.4.6",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "typescript": "^5.3.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.2",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0"
  }
}
```

**Task:**

- [ ] Create package.json
- [ ] Run `npm install` in BE/ folder

---

#### 3.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Task:**

- [ ] Create tsconfig.json

---

#### 3.3 .env.example

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hireme
MONGODB_TEST_URI=mongodb://localhost:27017/hireme-test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./src/uploads

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@hireme.com
FROM_NAME=HireMe Platform

# Frontend URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

**Tasks:**

- [ ] Create .env.example
- [ ] Copy .env.example to .env
- [ ] Update JWT_SECRET in .env with a strong secret

---

#### 3.4 .eslintrc.json

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "env": {
    "node": true,
    "es2020": true
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": "warn"
  }
}
```

**Task:**

- [ ] Create .eslintrc.json

---

#### 3.5 .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Task:**

- [ ] Create .prettierrc

---

#### 3.6 nodemon.json

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node ./src/server.ts"
}
```

**Task:**

- [ ] Create nodemon.json

---

### Step 4: Create Core Backend Utilities

#### 4.1 src/utils/logger.ts

```typescript
import winston from "winston";
import path from "path";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export { logger };
```

**Task:**

- [ ] Create src/utils/logger.ts

---

#### 4.2 src/utils/apiResponse.ts

```typescript
import { Response } from "express";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiSuccess<T = any> {
  static send(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static sendWithPagination(
    res: Response,
    data: T,
    pagination: ApiResponse["pagination"],
    message?: string,
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      pagination,
      message,
    };
    return res.status(statusCode).json(response);
  }
}
```

**Task:**

- [ ] Create src/utils/apiResponse.ts

---

#### 4.3 src/utils/apiError.ts

```typescript
import { Response } from "express";

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
  };
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static send(
    res: Response,
    error: ApiError | Error,
    statusCode: number = 500
  ) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error instanceof ApiError ? error.code : undefined,
        details: error instanceof ApiError ? error.details : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(errorResponse);
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message: string = "Forbidden") {
    return new ApiError(message, 403, "FORBIDDEN");
  }

  static notFound(message: string = "Resource not found") {
    return new ApiError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string, details?: any) {
    return new ApiError(message, 409, "CONFLICT", details);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(message, 500, "INTERNAL_SERVER_ERROR");
  }
}
```

**Task:**

- [ ] Create src/utils/apiError.ts

---

#### 4.4 src/utils/asyncHandler.ts

```typescript
import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

**Task:**

- [ ] Create src/utils/asyncHandler.ts

---

#### 4.5 src/utils/jwt.ts

```typescript
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
```

**Task:**

- [ ] Create src/utils/jwt.ts

---

#### 4.6 src/utils/helpers.ts

```typescript
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const sanitizeUser = (user: any) => {
  const { password, ...userWithoutPassword } = user.toObject
    ? user.toObject()
    : user;
  return userWithoutPassword;
};

export const getPaginationParams = (page?: string, limit?: string) => {
  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "10", 10);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10,
    skip,
  };
};

export const calculatePagination = (
  total: number,
  page: number,
  limit: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
```

**Task:**

- [ ] Create src/utils/helpers.ts

---

### Step 5: Create Configuration Files

#### 5.1 src/config/env.ts

```typescript
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRE: Joi.string().default("7d"),
  CLIENT_URL: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().default(5242880),
  UPLOAD_PATH: Joi.string().default("./src/uploads"),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
  },
  client: {
    url: envVars.CLIENT_URL,
  },
  upload: {
    maxSize: envVars.MAX_FILE_SIZE,
    path: envVars.UPLOAD_PATH,
  },
};
```

**Task:**

- [ ] Create src/config/env.ts

---

#### 5.2 src/config/database.ts

```typescript
import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/hireme";

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);

    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};
```

**Task:**

- [ ] Create src/config/database.ts

---

#### 5.3 src/config/constants.ts

```typescript
export const USER_ROLES = {
  STUDENT: "Student",
  RECRUITER: "Recruiter",
  TNP: "TnP",
} as const;

export const JOB_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

export const APPLICATION_STATUS = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
} as const;

export const PLACEMENT_STATUS = {
  PLACED: "Placed",
  NOT_PLACED: "Not Placed",
} as const;

export const JOB_TYPES = {
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
  PART_TIME: "Part-time",
} as const;

export const NOTIFICATION_TYPES = {
  JOB: "Job",
  APPLICATION: "Application",
  SYSTEM: "System",
  REMINDER: "Reminder",
} as const;

export const NOTIFICATION_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
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
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_REGISTER: "USER_REGISTER",
  JOB_CREATE: "JOB_CREATE",
  JOB_UPDATE: "JOB_UPDATE",
  JOB_DELETE: "JOB_DELETE",
  JOB_APPROVE: "JOB_APPROVE",
  JOB_REJECT: "JOB_REJECT",
  APPLICATION_SUBMIT: "APPLICATION_SUBMIT",
  APPLICATION_UPDATE: "APPLICATION_UPDATE",
  APPLICATION_WITHDRAW: "APPLICATION_WITHDRAW",
  RESUME_CREATE: "RESUME_CREATE",
  RESUME_UPDATE: "RESUME_UPDATE",
  STUDENT_VERIFY: "STUDENT_VERIFY",
  STUDENT_UNVERIFY: "STUDENT_UNVERIFY",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
} as const;
```

**Task:**

- [ ] Create src/config/constants.ts

---

#### 5.4 src/types/express.d.ts

```typescript
import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
```

**Task:**

- [ ] Create src/types/express.d.ts

---

### Step 6: Create Database Models

Refer to `requirement.txt` for complete schema specifications.

**Models to Create:**

1. **src/models/College.model.ts**
   - Simple schema with name field
   - Unique index on name
2. **src/models/User.model.ts**

   - Role-based embedded documents (studentDetails, recruiterDetails, tnpDetails)
   - Password hashing with bcrypt
   - Instance method: comparePassword()
   - Remove password from JSON responses
   - Indexes on email, role, college references

3. **src/models/Job.model.ts**

   - Complete job details with eligibility criteria
   - CTC range, skills, location
   - Status: Pending, Approved, Rejected
   - Approval workflow fields
   - Indexes on status, deadline, postedBy

4. **src/models/Application.model.ts**

   - Job and student references
   - Resume file metadata
   - Application status tracking
   - Interview details
   - Recruiter notes
   - Compound unique index on (jobId, studentId)

5. **src/models/Resume.model.ts**

   - Multi-section resume builder
   - Personal details, education, skills, projects, experience, achievements, certifications
   - Template and visibility settings
   - Unique index on studentId

6. **src/models/Notification.model.ts**

   - Recipient, title, message, type, priority
   - Read status and timestamps
   - Metadata for job/application references
   - TTL index for auto-expiry after 30 days

7. **src/models/ActivityLog.model.ts**
   - User actions audit trail
   - Action types, entity references
   - IP address and user agent tracking
   - Indexes on userId, action, timestamp

**Tasks:**

- [ ] Create College.model.ts
- [ ] Create User.model.ts with password hashing
- [ ] Create Job.model.ts
- [ ] Create Application.model.ts
- [ ] Create Resume.model.ts
- [ ] Create Notification.model.ts
- [ ] Create ActivityLog.model.ts
- [ ] Test all models with sample data

---

### Step 7: Create Middleware

#### 7.1 src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { verifyToken } from "../utils/jwt";

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Or from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized("Not authorized to access this route");
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
  }
);
```

**Task:**

- [ ] Create src/middleware/auth.middleware.ts

---

#### 7.2 src/middleware/roleCheck.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role ${req.user.role} is not allowed to access this resource`
      );
    }

    next();
  };
};
```

**Task:**

- [ ] Create src/middleware/roleCheck.middleware.ts

---

#### 7.3 src/middleware/errorHandler.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return ApiError.send(res, err, err.statusCode);
  }

  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const error = ApiError.conflict(`${field} already exists`);
    return ApiError.send(res, error, error.statusCode);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const error = ApiError.badRequest("Validation failed", (err as any).errors);
    return ApiError.send(res, error, error.statusCode);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const error = ApiError.unauthorized("Invalid token");
    return ApiError.send(res, error, error.statusCode);
  }

  if (err.name === "TokenExpiredError") {
    const error = ApiError.unauthorized("Token expired");
    return ApiError.send(res, error, error.statusCode);
  }

  // Default error
  const error = ApiError.internal("Something went wrong");
  return ApiError.send(res, error, 500);
};
```

**Task:**

- [ ] Create src/middleware/errorHandler.middleware.ts

---

#### 7.4 src/middleware/validation.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiError } from "../utils/apiError";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      throw ApiError.badRequest("Validation failed", details);
    }

    next();
  };
};
```

**Task:**

- [ ] Create src/middleware/validation.middleware.ts

---

#### 7.5 src/middleware/rateLimiter.middleware.ts

```typescript
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
});
```

**Task:**

- [ ] Create src/middleware/rateLimiter.middleware.ts

---

#### 7.6 src/middleware/upload.middleware.ts

```typescript
import multer from "multer";
import path from "path";
import { ApiError } from "../utils/apiError";
import { config } from "../config/env";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath =
      file.fieldname === "avatar"
        ? path.join(config.upload.path, "avatars")
        : path.join(config.upload.path, "resumes");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // For resumes, only allow PDF
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new ApiError("Only PDF files are allowed for resumes", 400));
    }
  }
  // For avatars, allow images
  else if (file.fieldname === "avatar") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only image files are allowed for avatars", 400));
    }
  } else {
    cb(null, true);
  }
};

// Upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize, // 5MB
  },
  fileFilter,
});
```

**Task:**

- [ ] Create src/middleware/upload.middleware.ts

---

#### 7.7 src/middleware/logger.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
```

**Task:**

- [ ] Create src/middleware/logger.middleware.ts

---

### Step 8: Create Validators

Create Joi validation schemas for all endpoints. See examples in validators/ folder.

**Tasks:**

- [ ] Create auth.validator.ts (register, login, change password)
- [ ] Create user.validator.ts (profile update, student verification)
- [ ] Create job.validator.ts (job creation, update, approval)
- [ ] Create application.validator.ts (application submission, status update)
- [ ] Create resume.validator.ts (resume sections validation)

---

### Step 9: Create Controllers

Implement business logic for all endpoints.

**Controllers to Create:**

1. **auth.controller.ts**

   - register (role-based signup)
   - login (JWT generation)
   - logout
   - verifyToken
   - changePassword

2. **user.controller.ts**

   - getProfile
   - updateProfile
   - getStudents (TnP only)
   - verifyStudent (TnP only)
   - deleteStudent (TnP only)

3. **job.controller.ts**

   - createJob (Recruiter)
   - getAllJobs (role-based filtering)
   - getJobById
   - updateJob (Recruiter - own jobs only)
   - deleteJob
   - approveJob (TnP)
   - rejectJob (TnP)

4. **application.controller.ts**

   - applyToJob (Student)
   - getMyApplications (Student)
   - getJobApplications (Recruiter/TnP)
   - updateApplicationStatus (Recruiter)
   - withdrawApplication (Student)

5. **resume.controller.ts**

   - createResume (Student)
   - getResume
   - updateResume
   - generateResumePDF
   - getStudentResume (Recruiter/TnP)

6. **notification.controller.ts**

   - getNotifications
   - markAsRead
   - markAllAsRead
   - deleteNotification

7. **college.controller.ts**

   - getAllColleges

8. **analytics.controller.ts**
   - getDashboardStats (role-specific)
   - getReports (TnP)

**Tasks:**

- [ ] Create all controller files
- [ ] Implement all controller methods
- [ ] Add proper error handling
- [ ] Add logging to controllers

---

### Step 10: Create Routes

Create route definitions and mount them.

**Tasks:**

- [ ] Create auth.routes.ts
- [ ] Create user.routes.ts
- [ ] Create job.routes.ts
- [ ] Create application.routes.ts
- [ ] Create resume.routes.ts
- [ ] Create notification.routes.ts
- [ ] Create college.routes.ts
- [ ] Create analytics.routes.ts
- [ ] Create routes/index.ts to aggregate all routes
- [ ] Mount routes in server.ts with /api prefix

---

### Step 11: Create Services

Implement reusable business logic services.

**Tasks:**

- [ ] Create auth.service.ts (token generation, password hashing)
- [ ] Create email.service.ts (optional email notifications)
- [ ] Create notification.service.ts (create and send notifications)
- [ ] Create file.service.ts (file upload, validation, storage)
- [ ] Create analytics.service.ts (data aggregation, reports)

---

### Step 12: Complete server.ts

```typescript
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDatabase } from "./config/database";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/logger.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { apiLimiter } from "./middleware/rateLimiter.middleware";
import routes from "./routes";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.client.url,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use("/api", apiLimiter);

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
connectDatabase();

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

export default app;
```

**Task:**

- [ ] Complete server.ts implementation
- [ ] Verify server starts without errors
- [ ] Verify database connects successfully

---

### Step 13: Create Seeders

#### 13.1 src/seeders/college.seeder.ts

Create seeder for popular Indian colleges (IITs, NITs, etc.)

#### 13.2 src/seeders/testData.seeder.ts

Create test data for development:

- Sample users (students, recruiters, TnP officers)
- Sample jobs
- Sample applications

**Tasks:**

- [ ] Create college seeder with 50+ colleges
- [ ] Create test data seeder
- [ ] Run seeders: `npm run seed:colleges`

---

## PHASE 3: FRONTEND SETUP

### Step 14: Initialize Frontend Project

Navigate to `FE/` folder.

**Frontend Folder Structure:**

```
FE/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── cards/
│   │   └── tables/
│   ├── pages/
│   │   ├── auth/
│   │   ├── student/
│   │   ├── recruiter/
│   │   ├── tnp/
│   │   └── common/
│   ├── features/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   ├── types/
│   ├── theme/
│   ├── routes/
│   ├── pdf/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── package.json
└── index.html
```

**Tasks:**

- [ ] Create all folders in FE/
- [ ] Initialize with `npm create vite@latest . -- --template react-ts`
- [ ] Or manually create all config files

---

### Step 15: Create Frontend Configuration Files

#### 15.1 package.json

```json
{
  "name": "hireme-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@mui/material": "^5.14.20",
    "@mui/icons-material": "^5.14.19",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.2",
    "yup": "^1.3.3",
    "axios": "^1.6.2",
    "@react-pdf/renderer": "^3.1.14",
    "date-fns": "^3.0.0",
    "framer-motion": "^10.16.16"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "prettier": "^3.1.1"
  }
}
```

**Task:**

- [ ] Create package.json
- [ ] Run `npm install` in FE/ folder

---

#### 15.2 vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

**Task:**

- [ ] Create vite.config.ts

---

#### 15.3 .env.example

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HireMe
```

**Tasks:**

- [ ] Create .env.example
- [ ] Copy to .env

---

#### 15.4 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Task:**

- [ ] Create tsconfig.json

---

### Step 16: Create Theme Configuration

Create Material-UI theme with Ubuntu font and purple color scheme.

**Task:**

- [ ] Create src/theme/theme.ts
- [ ] Import Ubuntu font from Google Fonts
- [ ] Set primary color to #A78BFA
- [ ] Configure component overrides

---

### Step 17: Setup Redux Store

**Tasks:**

- [ ] Create src/store/store.ts
- [ ] Create src/store/apiSlice.ts (RTK Query)
- [ ] Create src/features/auth/authSlice.ts
- [ ] Create src/features/auth/authAPI.ts
- [ ] Create similar structure for jobs, applications, notifications, users

---

### Step 18: Create Layout Components

**Tasks:**

- [ ] Create Header component with logo, notifications, profile
- [ ] Create Sidebar component (collapsible, role-based menu)
- [ ] Create MainLayout component
- [ ] Create AuthLayout component
- [ ] Create ProtectedRoute component
- [ ] Create RoleBasedRoute component

---

### Step 19: Create Authentication Pages

**Tasks:**

- [ ] Create Login page
- [ ] Create Register page (multi-step)
- [ ] Implement form validation
- [ ] Connect to backend API
- [ ] Handle JWT token storage

---

### Step 20: Create Student Module

**Tasks:**

- [ ] Create Student Dashboard
- [ ] Create Job Listing page with filters
- [ ] Create Job Details page
- [ ] Create My Applications page
- [ ] Create Resume Builder (multi-section)
- [ ] Create Profile page
- [ ] Implement PDF resume generation

---

### Step 21: Create Recruiter Module

**Tasks:**

- [ ] Create Recruiter Dashboard
- [ ] Create Post Job form
- [ ] Create Manage Jobs page
- [ ] Create View Applicants table
- [ ] Create Review Application interface
- [ ] Create Profile page

---

### Step 22: Create TnP Module

**Tasks:**

- [ ] Create TnP Dashboard with analytics
- [ ] Create Manage Students page
- [ ] Create Approve Jobs page
- [ ] Create View Applications page
- [ ] Create Reports page
- [ ] Create Profile page

---

### Step 23: Create Common Components

**Tasks:**

- [ ] Create NotificationBell component
- [ ] Create ConfirmDialog component
- [ ] Create Loader component
- [ ] Create ErrorBoundary component
- [ ] Create Breadcrumb component
- [ ] Create form components (InputField, SelectField, etc.)
- [ ] Create card components (JobCard, StatCard, etc.)

---

### Step 24: Create API Services

Create axios instance and service files for all API endpoints.

**Tasks:**

- [ ] Create src/utils/api.ts (axios config)
- [ ] Create src/services/authService.ts
- [ ] Create src/services/jobService.ts
- [ ] Create src/services/applicationService.ts
- [ ] Create src/services/resumeService.ts
- [ ] Create src/services/notificationService.ts
- [ ] Create src/services/userService.ts

---

## PHASE 4: INTEGRATION & VERIFICATION

### Step 25: Backend Verification

**Tasks:**

- [ ] Verify all API endpoints work with Postman/Insomnia
- [ ] Verify authentication and authorization
- [ ] Verify file uploads
- [ ] Verify role-based access control

---

### Step 26: Frontend-Backend Integration

**Tasks:**

- [ ] Connect all frontend pages to backend APIs
- [ ] Verify user registration and login flow
- [ ] Verify student job application workflow
- [ ] Verify recruiter job posting and applicant review
- [ ] Verify TnP student verification and job approval
- [ ] Verify notifications system
- [ ] Verify resume builder and PDF generation

---

### Step 27: Complete Workflow Verification

Verify complete user workflows:

**Tasks:**

- [ ] Student: Register → Verify → Browse jobs → Apply → Track application
- [ ] Recruiter: Register → Post job → Review applicants → Shortlist → Interview
- [ ] TnP: Register → Verify students → Approve jobs → Monitor placements → Reports

---

## PHASE 5: OPTIMIZATION & DEPLOYMENT

### Step 28: Performance Optimization

**Tasks:**

- [ ] Optimize database queries with indexes
- [ ] Implement caching where appropriate
- [ ] Optimize frontend bundle size
- [ ] Implement lazy loading for routes
- [ ] Optimize images and assets
- [ ] Add pagination to all list endpoints

---

### Step 29: Security Hardening

**Tasks:**

- [ ] Review and update all security middleware
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Review file upload security
- [ ] Implement API rate limiting
- [ ] Add security headers
- [ ] Review authentication flow

---

### Step 30: Deployment Preparation

**Tasks:**

- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Create docker-compose.yml
- [ ] Set up environment variables for production
- [ ] Configure MongoDB for production
- [ ] Set up SSL certificates
- [ ] Configure domain and hosting

---

## TIMELINE

**Week 1-2: Backend Core**

- Project setup and configuration
- Database models
- Utilities and middleware

**Week 3-4: Backend API**

- Controllers and routes
- Services
- Testing

**Week 5-6: Frontend Core**

- Project setup and configuration
- Theme and Redux
- Layout components
- Authentication

**Week 7-8: Student Module**

- All student pages and features
- Resume builder
- Job application workflow

**Week 9-10: Recruiter & TnP Modules**

- Recruiter pages
- TnP pages
- Analytics and reports

**Week 11-12: Optimization & Deployment**

- Performance optimization
- Final verification
- Deployment

---

## SUCCESS CHECKLIST

### Backend Completion

- [ ] All models created
- [ ] All middleware implemented
- [ ] All API endpoints working
- [ ] Authentication and authorization working
- [ ] File uploads working
- [ ] Error handling implemented
- [ ] Logging implemented
- [ ] Database seeded

### Frontend Completion

- [ ] All pages created
- [ ] Theme configured
- [ ] Redux store configured
- [ ] All components working
- [ ] Forms with validation
- [ ] API integration complete
- [ ] PDF generation working
- [ ] Responsive desktop layout

### Features Completion

- [ ] User registration and login
- [ ] Student job application
- [ ] Recruiter job posting
- [ ] TnP approval workflow
- [ ] Student verification
- [ ] Resume builder
- [ ] Notifications system
- [ ] Analytics dashboard
- [ ] File uploads
- [ ] Role-based access control

### Quality Assurance

- [ ] No console errors
- [ ] No security vulnerabilities
- [ ] Performance optimized
- [ ] All workflows functional

### Deployment

- [ ] Docker containers working
- [ ] Environment variables configured
- [ ] Database backup strategy
- [ ] SSL configured
- [ ] Domain configured
- [ ] Monitoring setup
- [ ] Logs accessible

---

## NOTES

- Follow the phased approach strictly
- Test each component before moving to the next
- Commit code regularly to Git
- Keep the requirement.txt file as reference
- Document any deviations from the plan
- Update this checklist as you complete tasks

---

## GETTING STARTED

**To start development:**

1. Review the complete plan
2. Set up your development environment
3. Install MongoDB locally
4. Start with Phase 1, Step 1
5. Mark tasks as complete: `[x]`
6. Proceed systematically through each phase

**For help in Cursor IDE:**

- Refer to requirement.txt for detailed specifications
- Check Material-UI documentation for components
- Review MongoDB documentation for queries
- Use Cursor's AI chat for code generation and debugging
- Use Cursor's Composer for multi-file edits
- Use Cursor's inline suggestions for faster coding

---

**Good luck with the HireMe platform development! 🚀**
