import express from 'express';
import { validateLoginInput } from '../middleware/auth.js';
import { authService } from '../services/auth.js';
import { AppError } from '../utils/errors.js';

const router = express.Router();

router.get('/login', (req, res) => {
  // Check if user is already logged in
  if (req.session.user) {
    return res.redirect('/admin');
  }
  res.render('login', { error: null });
});

router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signIn(email, password);

    if (!result.success) {
      return res.render('login', {
        error: result.error || 'Invalid email or password',
        email
      });
    }

    // Set session data
    req.session.user = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    };

    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        throw AppError.server('Error creating session');
      }
      res.redirect('/admin');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', {
      error: error instanceof AppError ? error.userMessage : 'An error occurred during login',
      email: req.body.email
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await authService.signOut();
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        throw AppError.server('Error destroying session');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/');
  }
});

export default router;