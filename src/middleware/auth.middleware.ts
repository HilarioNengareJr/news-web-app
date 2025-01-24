import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { Session } from '../types';
import * as bcrypt from 'bcryptjs';

const ADMIN_CREDENTIALS = {
  email: 'foo@email.com',
  passwordHash: await bcrypt.hash('admin123', 10)
};

export const requireAuth = (
  req: Request & { session: Session },
  res: Response,
  next: NextFunction
): void => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

export const validateLoginInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('login', { 
      error: 'Email and password are required',
      email
    });
  }

  if (email !== ADMIN_CREDENTIALS.email || 
      !(await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash))) {
    return res.render('login', {
      error: 'Invalid email or password',
      email
    });
  }

  next();
};
