import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[SCRIS Error]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
