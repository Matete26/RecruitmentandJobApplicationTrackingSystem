import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

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
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decoded; // Contains { id, role }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

/**
 * Role-based Authorization
 * Example: authorize('recruiter', 'admin')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Optional: Check if user is the owner of a resource (for candidate-specific actions)
 * Example: Only allow a candidate to view/update their own application
 */
export const isOwner = (resourceField = 'candidate') => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'recruiter') {
      return next(); // Admins and recruiters can access everything
    }

    // For candidates, check ownership
    if (req.params.id && req.body[resourceField] !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

export default {
  protect,
  authorize,
  isOwner
};