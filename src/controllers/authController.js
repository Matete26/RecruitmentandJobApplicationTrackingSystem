import User from '../models/userModel.js';
import { AppError } from '../middleware/errorMiddleware.js';
import crypto from 'crypto';
import authService from '../services/authService.js';

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
export const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    // Basic checks (detailed validation should use Zod middleware)
    if (!name || !email || !password || !passwordConfirm) {
      throw new AppError('Please provide all required fields', 400);
    }
    if (password !== passwordConfirm) throw new AppError('Passwords do not match', 400);
    validatePasswordStrength(password);

    const { user, token } = await authService.registerUser({ name, email, password, role });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    res.status(201).json({ success: true, message: 'Account created successfully. Please verify your email.', token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await authService.verifyEmailToken(token);
    res.json({ success: true, message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (Only verified emails allowed)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified };
    res.status(200).json({ success: true, message: 'Login successful', token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend Verification Email
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.resendVerification(email);
    res.json({ success: true, message: 'Verification email resent successfully' });
  } catch (error) {
    next(error);
  }
};

// Keep other methods
export const getMe = async (req, res, next) => {
  try {
    // authMiddleware now attaches full user
    if (!req.user) throw new AppError('Not authenticated', 401);
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'profile.phone', 'profile.location', 'profile.linkedin', 'profile.github', 'profile.skills'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, getMe, logout, updateProfile, verifyEmail, resendVerification };