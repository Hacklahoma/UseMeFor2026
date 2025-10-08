import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../config/logger';

// Validation middleware factory
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error', { errors, path: req.path });
        
        res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
        return;
      }
      
      logger.error('Unexpected validation error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Query parameter validation
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Query validation error', { errors, path: req.path });
        
        res.status(400).json({
          error: 'Invalid query parameters',
          details: errors
        });
        return;
      }
      
      logger.error('Unexpected query validation error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pagination: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10')
  })
};
