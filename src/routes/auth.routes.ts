import express, { Request, Response, NextFunction } from 'express';
import { validateLoginInput } from '../middleware/auth.middleware';

const router = express.Router();

// Type annotation for request, response, and next in the route handlers
router.post('/login', validateLoginInput, (req: Request, res: Response) => {
  res.redirect('/admin');
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

export default router;
