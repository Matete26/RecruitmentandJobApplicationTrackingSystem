import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AppError } from './errorMiddleware.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Protect routes - Verify JWT Token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authorized. No token provided.', 401));
  }

  try {
    // Verify token (centralized)
    const decoded = verifyToken(token);

    // Fetch full user from DB (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new AppError('User belonging to token no longer exists', 401));
    if (user.changedPasswordAfter(decoded.iat)) return next(new AppError('User recently changed password. Please login again.', 401));

    // Attach full user to request
    req.user = user;

    next();
  } catch (error) {
    // Token errors handled by global error middleware
    return next(error.name === 'TokenExpiredError' ? new AppError('Token expired. Please login again.', 401) : new AppError('Invalid token. Please login again.', 401));
  }
};

/**
 * Role-based Authorization
 * Example: authorize('recruiter', 'admin')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Not authorized', 401));
    if (!allowedRoles.includes(req.user.role)) return next(new AppError(`Access denied. Required role(s): ${allowedRoles.join(', ')}`, 403));
    next();
  };
};

/**
 * Optional: Check if user is the owner of a resource (for candidate-specific actions)
 * Example: Only allow a candidate to view/update their own application
 */
export const isOwner = ({ Model, resourceIdParam = 'id', ownerField = 'candidate' } = {}) => {
  return async (req, res, next) => {
    // Admins and recruiters bypass ownership checks
    if (req.user && (req.user.role === 'admin' || req.user.role === 'recruiter')) return next();

    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];
    if (!resourceId) return next(new AppError('Resource id not provided for ownership check', 400));

    if (!Model) return next(new AppError('Ownership check requires a Model to be provided', 500));

    try {
      const resource = await Model.findById(resourceId).select(ownerField);
      if (!resource) return next(new AppError('Resource not found', 404));

      const ownerId = resource[ownerField] && resource[ownerField].toString ? resource[ownerField].toString() : String(resource[ownerField]);
      const userId = req.user._id ? req.user._id.toString() : String(req.user.id || req.user._id);

      if (ownerId !== userId) return next(new AppError('You can only access your own resources', 403));

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default {
  protect,
  authorize,
  isOwner
};