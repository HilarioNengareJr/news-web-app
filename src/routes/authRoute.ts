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
import { isAuthenticated } from '../middlewares/auth_user.middleware';

const router = Router();
const authController = new AuthController();

router.get('/admin/login', authController.showLogin);
router.post('/admin/login', authController.login);
router.get('/auth/logout', authController.logout);
router.get('/admin/dashboard', isAuthenticated, authController.showDashboard);

export default router;