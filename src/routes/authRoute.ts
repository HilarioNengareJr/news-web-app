/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict'

import { Router } from 'express';
import { AuthController } from '../controllers/authUser';
import { isAuthenticated } from '../middlewares/authUserMiddleware';
import { validateLogin, validateRegistration } from '../middlewares/validationMiddleware';

const authRouter = Router();
const authController = new AuthController();

// Public routes
authRouter.get('/login', authController.showLogin);
authRouter.post('/login', validateLogin, authController.login);
authRouter.post('/register', validateRegistration, authController.register);

// Protected routes
authRouter.get('/logout', isAuthenticated, authController.logout);
authRouter.get('/dashboard', isAuthenticated, authController.showDashboard);

export default authRouter;
