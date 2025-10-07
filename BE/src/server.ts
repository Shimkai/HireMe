/// <reference path="./types/express.d.ts" />
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { apiLimiter, devApiLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';

const app: Application = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

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

// Rate limiting - use development-friendly limiter
if (process.env.NODE_ENV === 'development') {
  app.use('/api', devApiLimiter);
} else {
  app.use('/api', apiLimiter);
}

// Serve static files (uploads) with CORS headers
app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(path.join(__dirname, '..', 'src', 'uploads')));

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
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
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;

