/**
 * @license MIT
 * @author
 * Hilario Junior Nengare 2025
 */

'use strict';

import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

export interface AuthenticatedRequest extends Request {
  session: Session & {
    user?: {
      id: string;
      email: string;
      isAdmin: boolean;
    };
  }
}

export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session.user?.isAdmin) {
    next();
  } else {
    res.redirect('../../Views/pages/login');
  }
};