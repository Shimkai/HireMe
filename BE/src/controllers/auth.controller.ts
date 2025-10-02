import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import * as authService from '../services/auth.service';
import ActivityLog from '../models/ActivityLog.model';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.registerUser(req.body);

  // Log activity
  await ActivityLog.create({
    userId: user._id,
    action: 'USER_REGISTER',
    entityType: 'User',
    entityId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiSuccess.send(res, { user, token }, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);

  // Log activity
  await ActivityLog.create({
    userId: user._id,
    action: 'USER_LOGIN',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiSuccess.send(res, { user, token }, 'Login successful');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await ActivityLog.create({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  ApiSuccess.send(res, null, 'Logout successful');
});

export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  ApiSuccess.send(res, { user: req.user }, 'Token valid');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const { currentPassword, newPassword } = req.body;
  await authService.changeUserPassword(req.user.id, currentPassword, newPassword);

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'PASSWORD_CHANGE',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ApiSuccess.send(res, null, 'Password changed successfully');
});

