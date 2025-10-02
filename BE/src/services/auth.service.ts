import User from '../models/User.model';
import { generateToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { sanitizeUser } from '../utils/helpers';

export const registerUser = async (userData: any): Promise<{ user: any; token: string }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const tokenPayload: TokenPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: any; token: string }> => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password').populate('studentDetails.college tnpDetails.college');

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden('Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const tokenPayload: TokenPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();
};

