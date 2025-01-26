/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

/**
 *  Node Modules
 */
import express, { Request, Response, NextFunction } from 'express';

/**
 *  Custom Modules
 */
import { validateLoginInput } from '../middleware/auth.middleware';

const router = express.Router();

/** 
 * Type annotation for request, response, and next in the route handlers
 */ 
router.post('/login', validateLoginInput, (req: Request, res: Response) => {
  res.redirect('/admin');
});

/**
 * Logout function
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

export default router;
