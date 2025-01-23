import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return next(AppError.authentication('Please login to access this page'));
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return next(AppError.authorization('Admin privileges required'));
  }
  next();
}
