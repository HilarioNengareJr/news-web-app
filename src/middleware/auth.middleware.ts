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

  // Verify user still exists in database
  try {
    const result = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [req.session.user.id]
    );
    
    if (result.rows.length === 0) {
      req.session.destroy(() => {});
      return res.redirect('/login');
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    next(AppError.database('Failed to verify user'));
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
