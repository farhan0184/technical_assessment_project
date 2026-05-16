import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.path} -`, err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database query error',
      details: err.message,
    });
  }

  // Unknown errors
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    details: err.message, // Temporarily show details in production
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
