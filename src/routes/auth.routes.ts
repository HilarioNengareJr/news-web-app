import express from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/errors';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw AppError.validation('Email and password are required');
    }

    const { success, user } = await authService.signIn(email, password);

    if (!success || !user) {
      throw AppError.authentication('Invalid email or password');
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(AppError.server('Failed to logout'));
    }
    res.redirect('/');
  });
});

export default router;
