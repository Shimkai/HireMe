import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes (reduced from 15)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'), // Increased from 100
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window (increased from 5)
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// More lenient limiter for development
export const devAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Very lenient limiter for testing
export const testAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Development limiter - very permissive
export const devApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// No rate limiting for development
export const noRateLimit = (_req: any, _res: any, next: any) => {
  next();
};

