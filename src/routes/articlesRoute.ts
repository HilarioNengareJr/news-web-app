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
import { ArticleController } from '../controllers/articleController';

const router = Router();
const articleController = new ArticleController();

router.get('/', articleController.getAllArticles);
router.get('/article/:id', articleController.getArticleById);
router.get('/search', articleController.searchArticles);

export default router;