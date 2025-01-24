import express from 'express';
import { validateLoginInput } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', validateLoginInput, (req, res) => {
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

export default router;
