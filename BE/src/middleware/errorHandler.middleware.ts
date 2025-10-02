import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return ApiError.send(res, err, err.statusCode);
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const error = ApiError.conflict(`${field} already exists`);
    return ApiError.send(res, error, error.statusCode);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const error = ApiError.badRequest('Validation failed', (err as any).errors);
    return ApiError.send(res, error, error.statusCode);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const error = ApiError.unauthorized('Invalid token');
    return ApiError.send(res, error, error.statusCode);
  }

  if (err.name === 'TokenExpiredError') {
    const error = ApiError.unauthorized('Token expired');
    return ApiError.send(res, error, error.statusCode);
  }

  // Default error
  const error = ApiError.internal('Something went wrong');
  return ApiError.send(res, error, 500);
};

