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
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/AuthenticatedRequest';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public showLogin = (req: AuthenticatedRequest, res: Response): void => {
    if (req.session.user?.isAdmin) {
      res.redirect('/pages/dashboard');
      return;
    }
    res.render('/pages/login.ejs', { user: req.session.user });
  };

  public login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await this.authService.login(email, password);
      
      if (!user) {
        res.render('/pages/login', {
          error: 'Invalid email or password',
          user: req.session.user
        });
        return;
      }

      req.session.user = user;
      res.redirect('/pages/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      res.render('/pages/login', {
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
    res.render('/pages/dashboard', { user: req.session.user });
  };
}