/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { verifyToken } from '../utils/jwt';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Or from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Not authorized to access this route');
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }
);

