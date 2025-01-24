import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorMessages } from '../utils/errors';
import { Session } from '../types';
import { pool } from '../db/connection';

export const requireAuth = async (
  req: Request & { session: Session },
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    // Verify user exists and is admin
    const result = await pool.query<{ role: string }>(
      `SELECT role FROM users 
       WHERE id = $1 AND role = 'admin'`,
      [req.session.user.id]
    );

    if (result.rows.length === 0) {
      req.session.destroy(() => {});
      return res.redirect('/login');
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    next(AppError.database('Failed to verify admin privileges'));
  }
};

export const validateLoginInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
};
