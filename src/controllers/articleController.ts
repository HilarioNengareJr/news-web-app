import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { AuthenticatedRequest } from '../middlewares/AuthenticatedRequest';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  public getAllArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const articles = await this.articleService.getAllArticles();
      res.render('home', { 
        articles,
        currentPage: 1,
        totalPages: 3,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).render('error', {
        message: 'Error fetching articles',
        error: { status: 500 },
        user: req.session.user
      });
    }
  };

  public getArticleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const article = await this.articleService.getArticleById(req.params.id);
      if (!article) {
        res.status(404).render('error', {
          message: 'Article not found',
          error: { status: 404 },
          user: req.session.user
        });
        return;
      }
      res.render('article', { article, user: req.session.user });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).render('error', {
        message: 'Error fetching article',
        error: { status: 500 },
        user: req.session.user
      });
    }
  };

  public searchArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      const articles = await this.articleService.searchArticles(query);
      res.render('search', {
        articles,
        query,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).render('error', {
        message: 'Error searching articles',
        error: { status: 500 },
        user: req.session.user
      });
    }
  };
}