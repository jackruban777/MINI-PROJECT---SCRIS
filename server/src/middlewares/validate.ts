import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: issues.map((e: any) => ({
              field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: issues.map((e: any) => ({
              field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
};
