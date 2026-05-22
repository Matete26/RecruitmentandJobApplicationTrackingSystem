/**
 * Role-based Authorization Middleware
 * 
 * Usage:
 * authorize('admin')
 * authorize('recruiter', 'hiring_manager')
 * authorize('candidate')
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user exists (protect middleware should run first)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Specific Role Checkers (Convenience middleware)
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
};

export const isRecruiter = (req, res, next) => {
  if (req.user?.role === 'recruiter' || req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Recruiter privileges required.'
  });
};

export const isCandidate = (req, res, next) => {
  if (req.user?.role === 'candidate') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Candidate access only.'
  });
};

export const isHiringManager = (req, res, next) => {
  if (req.user?.role === 'hiring_manager' || req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Hiring Manager privileges required.'
  });
};

export default {
  authorize,
  isAdmin,
  isRecruiter,
  isCandidate,
  isHiringManager
};