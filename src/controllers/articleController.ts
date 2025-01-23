import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { AuthenticatedRequest } from '../middlewares/AuthenticatedRequest';
import { Article } from '../types/articleType';
import createHttpError from 'http-errors';
import { Session } from 'express-session';

interface CustomSession extends Session {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  public getAllArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const articles = await this.articleService.getAllArticles();
      const totalArticles = articles.length;
      const totalPages = Math.ceil(totalArticles / limit);

      // Format dates for display
      const formattedArticles = articles.map(article => ({
        ...article,
        createdAt: new Date(article.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));

      const session = req.session as CustomSession;
      res.render('pages/home', { 
        articles: formattedArticles.slice((page - 1) * limit, page * limit),
        currentPage: page,
        totalPages,
        user: session.user,
        hideSearch: false
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error fetching articles';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };

  public getArticleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const article = await this.articleService.getArticleById(req.params.id);
      if (!article) {
        throw createHttpError(404, 'Article not found');
      }
      // Format date for display
      const formattedArticle = {
        ...article,
        createdAt: new Date(article.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const session = req.session as CustomSession;
      res.render('pages/article', { 
        article: formattedArticle, 
        user: session.user,
        hideSearch: true
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error fetching article';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };

  public searchArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw createHttpError(400, 'Search query is required');
      }
      
      const articles = await this.articleService.searchArticles(query);
      // Format dates for display
      const formattedArticles = articles.map(article => ({
        ...article,
        createdAt: new Date(article.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));

      const session = req.session as CustomSession;
      res.render('partials/search', {
        articles: formattedArticles,
        query,
        user: session.user,
        hideSearch: true
      });
    } catch (error) {
      console.error('Error searching articles:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error searching articles';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };

  public createArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.session.user?.isAdmin) {
        throw createHttpError(403, 'Unauthorized');
      }

      const articleData: Omit<Article, 'id'> = {
        title: req.body.title,
        content: req.body.content,
        excerpt: req.body.excerpt,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags?.split(',').map((tag: string) => tag.trim()) || [],
        author: req.session.user.email,
        slug: req.body.slug,
        author_id: req.session.user.id,
        published_at: req.body.published ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newArticle = await this.articleService.createArticle(articleData);
      res.redirect(`/articles/article/${newArticle.id}`);
    } catch (error) {
      console.error('Error creating article:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error creating article';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };

  public updateArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.session.user?.isAdmin) {
        throw createHttpError(403, 'Unauthorized');
      }

      const updates: Partial<Article> = {
        title: req.body.title,
        content: req.body.content,
        excerpt: req.body.excerpt,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags?.split(',').map((tag: string) => tag.trim()) || [],
        slug: req.body.slug,
        updated_at: new Date().toISOString(),
        published_at: req.body.published ? new Date().toISOString() : null
      };

      const updatedArticle = await this.articleService.updateArticle(req.params.id, updates);
      res.redirect(`/articles/article/${updatedArticle.id}`);
    } catch (error) {
      console.error('Error updating article:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error updating article';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };

  public deleteArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.session.user?.isAdmin) {
        throw createHttpError(403, 'Unauthorized');
      }

      await this.articleService.deleteArticle(req.params.id);
      res.redirect('/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
      const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      const message = error instanceof Error ? error.message : 'Error deleting article';
      const session = req.session as CustomSession;
      
      res.status(status).render('error', {
        message,
        error: { status },
        user: session.user
      });
    }
  };
}
