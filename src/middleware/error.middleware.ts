import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(err instanceof AppError)) {
    console.error('Unexpected error:', err);
    err = AppError.server('Internal server error');
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: {
      status,
      message
    }
  });
}
