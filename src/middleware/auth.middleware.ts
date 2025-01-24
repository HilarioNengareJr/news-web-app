import { Request, Response, NextFunction } from 'express';
import { Session } from '../types'; 
import { default as bcrypt } from 'bcryptjs';

let ADMIN_CREDENTIALS: { email: string; passwordHash: string } | null = null;

async function initAdminCredentials(): Promise<{ email: string; passwordHash: string } | null> {
  if (!ADMIN_CREDENTIALS) {
    ADMIN_CREDENTIALS = {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password', 10)
    };
  }
  return ADMIN_CREDENTIALS;
}

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

  const credentials = await initAdminCredentials();
  if (credentials === null || email !== credentials.email || 
      !(await bcrypt.compare(password, credentials.passwordHash))) {
    return res.render('login', {
      error: 'Invalid email or password',
      email
    });
  }

  next();
};
