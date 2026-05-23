import User from '../models/userModel.js';
import crypto from 'crypto';
import { signToken } from '../utils/jwt.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const registerUser = async ({ name, email, password, role }, { UserModel = User, sendEmail = sendVerificationEmail } = {}) => {
  if (!name || !email || !password) throw new AppError('Please provide all required fields', 400);

  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('User with this email already exists', 400);

  const user = await UserModel.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'candidate',
    isActive: true,
    isEmailVerified: false
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  // Send verification email best-effort
  // Don't let email failure break registration
try {
  await sendVerificationEmail(user.email, user.name, verificationToken);
} catch (emailError) {
  console.error('sendVerificationEmail error:', emailError.message);
  // Continue — user is created, email can be resent later
}

  const token = signToken({ id: user._id, role: user.role });

  return { user, token };
};

export const loginUser = async ({ email, password }, { UserModel = User } = {}) => {
  if (!email || !password) throw new AppError('Please provide email and password', 400);

  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('Your account has been deactivated', 403);
  if (!user.isEmailVerified) throw new AppError('Please verify your email before logging in', 403);

  const token = signToken({ id: user._id, role: user.role });
  return { user, token };
};

export const resendVerification = async (email, { UserModel = User, sendEmail = sendVerificationEmail } = {}) => {
  if (!email) throw new AppError('Email is required', 400);
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('User not found', 404);
  if (user.isEmailVerified) throw new AppError('Email already verified', 400);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (emailError) {
    console.error('sendVerificationEmail error:', emailError.message);
  }

  return true;
};

export const verifyEmailToken = async (token, { UserModel = User } = {}) => {
  if (!token) throw new AppError('Token is required', 400);
  const user = await UserModel.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
  if (!user) throw new AppError('Invalid or expired verification token', 400);

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

export default { registerUser, loginUser, resendVerification, verifyEmailToken };
