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

  // Validate verification passkey for Recruiter and TnP
  if (userData.role === 'Recruiter' || userData.role === 'TnP') {
    const expectedPasskey = userData.role === 'Recruiter' ? 'recruiterverify' : 'tnpverify';
    if (!userData.verificationPasskey) {
      throw ApiError.badRequest('Verification passkey is required');
    }
    if (userData.verificationPasskey !== expectedPasskey) {
      throw ApiError.badRequest('Invalid verification passkey. Please enter the correct passkey.');
    }
  }

  // Remove verificationPasskey from userData before creating user (it's not stored in the database)
  delete userData.verificationPasskey;

  // Set default college for students if not specified
  if (userData.role === 'Student' && userData.studentDetails && !userData.studentDetails.college) {
    const College = require('../models/College.model').default;
    const defaultCollege = await College.findOne({ name: 'G. H. Raisoni College of Engineering and Management, Pune' });
    if (defaultCollege) {
      userData.studentDetails.college = defaultCollege._id;
      console.log('Set default college for new student:', defaultCollege.name);
    }
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
  const user = await User.findOne({ email }).select('+password');

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

  // Populate college references if they exist
  try {
    if (user.role === 'Student' && user.studentDetails?.college) {
      await user.populate('studentDetails.college');
    }
    if (user.role === 'TnP' && user.tnpDetails?.college) {
      await user.populate('tnpDetails.college');
    }
  } catch (populateError) {
    console.warn('College population failed:', populateError);
    // Continue without population - this is not critical for login
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

