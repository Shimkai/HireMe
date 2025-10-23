/// <reference path="./types/express.d.ts" />
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { apiLimiter, devApiLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';
import SocketService from './services/socket.service';

const app: Application = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  config.client.url,
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
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
const uploadsPath = config.env === 'development' 
  ? path.join(process.cwd(), 'src', 'uploads')
  : path.join(__dirname, 'uploads');

app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(uploadsPath));

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

// Start server with port conflict handling
const PORT = config.port;

const startServer = async () => {
  try {
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize Socket.IO
    new SocketService(server);
    
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
      logger.info(`📡 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API base URL: http://localhost:${PORT}/api`);
      logger.info(`🔌 WebSocket server initialized`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use!`);
        logger.error('💡 Solutions:');
        logger.error('   1. Kill the process using this port:');
        logger.error(`      netstat -ano | findstr :${PORT}`);
        logger.error(`      taskkill /PID <PID> /F`);
        logger.error('   2. Or change the PORT in your .env file');
        logger.error('   3. Or wait a few seconds and try again');
        process.exit(1);
      } else {
        logger.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;

