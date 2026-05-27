import User from '../models/userModel.js';
import crypto from 'crypto';
import { signToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
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

const createRefreshTokenForUser = async (user) => {
  const refreshToken = signRefreshToken({ id: user._id, role: user.role });
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  await user.save({ validateBeforeSave: false });
  return refreshToken;
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
  const refreshToken = await createRefreshTokenForUser(user);
  return { user, token, refreshToken };
};

export const refreshAuthToken = async (refreshToken, { UserModel = User } = {}) => {
  if (!refreshToken) throw new AppError('Refresh token is required', 400);

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw error.name === 'TokenExpiredError'
      ? new AppError('Refresh token expired. Please login again.', 401)
      : new AppError('Invalid refresh token. Please login again.', 401);
  }

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const user = await UserModel.findOne({
    _id: decoded.id,
    refreshToken: hashedToken,
    refreshTokenExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError('Refresh token is invalid or has expired', 401);
  if (user.changedPasswordAfter(decoded.iat)) throw new AppError('Password changed recently. Please login again.', 401);

  const token = signToken({ id: user._id, role: user.role });
  const newRefreshToken = await createRefreshTokenForUser(user);

  return { user, token, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId, { UserModel = User } = {}) => {
  const user = await UserModel.findById(userId);
  if (!user) return false;

  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return true;
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

export const forgotPassword = async (email, { UserModel = User, sendEmail = sendPasswordResetEmail } = {}) => {
  if (!email) throw new AppError('Email is required', 400);
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('User not found', 404);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail(user.email, user.name, resetToken);
  } catch (emailError) {
    console.error('sendPasswordResetEmail error:', emailError.message);
  }

  return true;
};

export const resetPassword = async (token, password, passwordConfirm, { UserModel = User } = {}) => {
  if (!token) throw new AppError('Token is required', 400);
  if (!password || !passwordConfirm) throw new AppError('Password and passwordConfirm are required', 400);
  if (password !== passwordConfirm) throw new AppError('Passwords do not match', 400);

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError('Invalid or expired password reset token', 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  const refreshToken = await createRefreshTokenForUser(user);
  const jwtToken = signToken({ id: user._id, role: user.role });

  return { user, token: jwtToken, refreshToken };
};

export default { registerUser, loginUser, resendVerification, verifyEmailToken, forgotPassword, resetPassword, refreshAuthToken, logoutUser };
