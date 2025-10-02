import { Response } from 'express';

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

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static send(res: Response, error: ApiError | Error, statusCode: number = 500) {
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
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, details?: any) {
    return new ApiError(message, 409, 'CONFLICT', details);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

