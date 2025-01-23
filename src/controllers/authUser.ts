/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict'

/**
 * node modules
 */
import { Response} from 'express';

/**
 * custom modules
 */
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth_user.middleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export class AuthController {
  private auth.service: auth.service;

  constructor() {
    this.auth.service = new auth.service();
  }

  public showLogin = (req: AuthenticatedRequest, res: Response): void => {
    if (req.session.user?.isAdmin) {
      res.redirect('/admin/dashboard');
      return;
    }
    res.render('admin/login', { user: req.session.user });
  };

  public login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await this.auth.service.login(email, password);
      
      if (!user) {
        res.render('admin/login', {
          error: 'Invalid email or password',
          user: req.session.user
        });
        return;
      }

      req.session.user = user;
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      res.render('admin/login', {
        error: 'Invalid login credentials',
        user: req.session.user
      });
    }
  };

  public logout = (req: AuthenticatedRequest, res: Response): void => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };

  public showDashboard = (req: AuthenticatedRequest, res: Response): void => {
    res.render('admin/dashboard', { user: req.session.user });
  };
}