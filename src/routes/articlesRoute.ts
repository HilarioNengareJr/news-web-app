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

const articlesRouter = Router();
const articleController = new ArticleController();

articlesRouter.get('/', articleController.getAllArticles);
articlesRouter.get('/article/:id', articleController.getArticleById);
articlesRouter.get('/search', articleController.searchArticles);

export { articlesRouter };
