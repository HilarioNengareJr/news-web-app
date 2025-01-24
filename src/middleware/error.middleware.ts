import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorResponse } from '../types';

/**
 * Error handling middleware that formats and returns consistent error responses
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  // Handle unexpected errors
  if (!(err instanceof AppError)) {
    console.error('Unexpected error:', err);
    err = AppError.server('Internal server error');
  }

  // Type guard to ensure err is AppError
  if (err instanceof AppError) {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${new Date().toISOString()}] Error:`, {
        status,
        message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
    }

    // Send error response
    res.status(status).json({
      error: {
        status,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  } else {
    // Fallback for truly unexpected errors
    res.status(500).json({
      error: {
        status: 500,
        message: 'Internal server error'
      }
    });
  }
}
