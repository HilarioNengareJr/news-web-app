/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict'

import { Router } from 'express';
import multer from 'multer';
import { ArticleController } from '../controllers/articleController';
import { isAuthenticated } from '../middlewares/authUserMiddleware';

const articlesRouter = Router();
const articleController = new ArticleController();
const upload = multer();

// Public routes
articlesRouter.get('/', articleController.getAllArticles);
articlesRouter.get('/article/:id', articleController.getArticleById);
articlesRouter.get('/search', articleController.searchArticles);

// Protected admin routes
articlesRouter.post('/create', isAuthenticated, upload.single('image'), articleController.createArticle);
articlesRouter.post('/update/:id', isAuthenticated, upload.single('image'), articleController.updateArticle);
articlesRouter.post('/delete/:id', isAuthenticated, articleController.deleteArticle);

export { articlesRouter };
