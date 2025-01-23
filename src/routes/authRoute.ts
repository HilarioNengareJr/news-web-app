/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict'

/**
 * node modules
 */

import { Router } from 'express';


/**
 * custom modules
 */
import { AuthController } from '../controllers/authUser';
import { isAuthenticated } from '../middlewares/authUserMiddleware';

const authRouter = Router();
const authController = new AuthController();

authRouter.get('/pages/login', authController.showLogin);
authRouter.post('/pages/login', authController.login);
authRouter.get('/auth/logout', authController.logout);
authRouter.get('/pages/dashboard', isAuthenticated, authController.showDashboard);

export default authRouter;