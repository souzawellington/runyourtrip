
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { Logger } from '../utils/logger';

// Enhanced rate limiting for different endpoints
export const createRateLimit = (requests: number, windowMs: number, message: string) => 
  rateLimit({
    windowMs,
    max: requests,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      Logger.warn(`Rate limit exceeded for ${req.ip}`, {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      res.status(429).json({ error: message });
    }
  });

// Strict API rate limits
export const apiRateLimit = createRateLimit(100, 15 * 60 * 1000, 'Too many API requests');
export const authRateLimit = createRateLimit(5, 15 * 60 * 1000, 'Too many login attempts');
export const aiRateLimit = createRateLimit(10, 60 * 1000, 'Too many AI generation requests');

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = sanitize(value);
      }
      return cleaned;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  next();
};

// Request validation with Zod schemas
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;
      
      next();
    } catch (error) {
      Logger.warn('Request validation failed', { 
        path: req.path, 
        error: error instanceof z.ZodError ? error.errors : error 
      });
      res.status(400).json({ 
        error: 'Invalid request data',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
};
