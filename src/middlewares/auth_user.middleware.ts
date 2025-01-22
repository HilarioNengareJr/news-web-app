/**
 * @license MIT
 * @author
 * Hilario Junior Nengare 2025
 */

'use strict';

import { Request, Response } from 'express';

export const login = (req: Request, res: Response): void => {
  const { access_token, refresh_token } = req.cookies;

  if (access_token && refresh_token) {
    return res.redirect('/');
  } else {
    res.render('./pages/login');
  }

  res.render('./pages/login');
};
