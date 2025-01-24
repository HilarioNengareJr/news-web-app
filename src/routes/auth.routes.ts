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

    // Check for default admin credentials
    if (email === 'admin@news.com') {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        throw AppError.authentication('Invalid email or password');
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        throw AppError.authentication('Invalid email or password');
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      return res.redirect('/admin');
    }

    // Regular user login
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
