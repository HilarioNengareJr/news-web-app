import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorMessages } from '../utils/errors';
import { Session } from '../types';

export function requireAuth(req: Request & { session: Session }, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return next(AppError.authentication('Please login to access this page'));
  }
  next();
}

export function requireAdmin(req: Request & { session: Session }, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return next(AppError.authorization('Admin privileges required'));
  }
  next();
}

export function validateLoginInput(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('login', { 
      error: ErrorMessages.VALIDATION.required,
      email
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.render('login', {
      error: ErrorMessages.VALIDATION.default,
      email
    });
  }

  if (!email.includes('@') || email.length < 5) {
    return res.render('login', {
      error: ErrorMessages.VALIDATION.email,
      email
    });
  }

  if (password.length < 6) {
    return res.render('login', {
      error: ErrorMessages.VALIDATION.password,
      email
    });
  }

  next();
}
