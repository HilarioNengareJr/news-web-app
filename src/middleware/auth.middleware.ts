/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

/**
 * Node Modules
 */
import { Request, Response, NextFunction } from 'express';
import { default as bcrypt } from 'bcryptjs';

/**
 * Custom Modules
 */
import { Session } from '../types';

let ADMIN_CREDENTIALS: { email: string; passwordHash: string } | null = null;

/**
 * 
 * @returns Promise<{ email: string; passwordHash: string } | null>
 */
async function initAdminCredentials(): Promise<{ email: string; passwordHash: string } | null> {
  ADMIN_CREDENTIALS = {
    email: 'admin@example.com',
    passwordHash: await bcrypt.hash('password', 10)
  };

  return ADMIN_CREDENTIALS;
}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
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

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const validateLoginInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // Ensure email and password are provided
  if (!email || !password) {
    return res.render('login', {
      error: 'Email and password are required',
      email
    });
  }

  /**
   * Initialize credentials (this will always set the default credentials)  
   */
  const credentials = await initAdminCredentials();

  /** 
   * Check if email and hashed password match
   */
  if (credentials === null || email !== credentials.email || !(await bcrypt.compare(password, credentials.passwordHash))) {
    // If they do not match, return error message
    return res.render('login', {
      error: 'Invalid email or password',
      email
    });
  }
  req.session.user = { email: credentials.email };
  res.redirect('/admin');

  next();
};
