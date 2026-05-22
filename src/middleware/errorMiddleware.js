/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle specific error types
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found with id: ${err.value}`, 404);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value for ${field}. Please use another value.`, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 [ERROR]:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
    });
  } else {
    // In production, log only essential info
    console.error(`🔴 [ERROR] ${error.statusCode}: ${error.message}`);
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

/**
 * 404 Not Found Handler
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

export default {
  AppError,
  errorHandler,
  notFound,
};