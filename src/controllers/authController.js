import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorMiddleware.js';
import crypto from 'crypto';

/**
 * Password Strength Validator
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new AppError(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      400
    );
  }
};

/**
 * Register a new user with enhanced validation
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !passwordConfirm) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Password confirmation
    if (password !== passwordConfirm) {
      throw new AppError('Passwords do not match', 400);
    }

    // Password strength validation
    validatePasswordStrength(password);

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create user (email not verified yet)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'candidate',
      isEmailVerified: false
    });

    // Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email (implement email service)
    // await sendVerificationEmail(user.email, verificationToken);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Login user (Only verified emails allowed)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email before logging in', 403);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * Resend Verification Email
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('User not found', 404);
    if (user.isEmailVerified) throw new AppError('Email already verified', 400);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // TODO: Send email
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email resent successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Keep other methods
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new AppError('User not found', 404);

    res.json({ success: true, user });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'profile.phone', 'profile.location', 'profile.linkedin', 'profile.github', 'profile.skills'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

export default {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  verifyEmail,
  resendVerification
};