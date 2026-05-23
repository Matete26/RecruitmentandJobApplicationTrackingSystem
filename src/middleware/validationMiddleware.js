import { AppError } from './errorMiddleware.js';

/**
 * Validate request using a Zod schema. Usage: validate(schema)
 */
export const validate = (schema, options = {}) => {
  return async (req, res, next) => {
    try {
      const target = options.params ? req.params : req.body;
      await schema.parseAsync(target);
      next();
    } catch (err) {
      // Zod errors have errors array
      const message = err.errors ? err.errors.map(e => e.message).join('. ') : err.message;
      next(new AppError(message || 'Validation failed', 400));
    }
  };
};

export default { validate };
