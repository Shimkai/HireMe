/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role ${req.user.role} is not allowed to access this resource`
      );
    }

    next();
  };
};

