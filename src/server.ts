import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { pool } from './db/connection';
import { errorHandler } from './middleware/error.middleware';
import { AppError, ErrorMessages } from './utils/errors';
import { articleService } from './services/article.service';
import authRoutes from './routes/auth.routes';
import { requireAuth, validateLoginInput } from './middleware/auth.middleware';

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test database connection
await pool.query('SELECT NOW()');
console.log('Database connection established');

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Security middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET ?? (() => {
    throw new Error('SESSION_SECRET environment variable is required');
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static(join(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.showSearch = req.path === '/articles' && !req.path.startsWith('/login');
  res.locals.isAdmin = !!req.session.user;
  next();
});

// Auth routes
app.use('/', authRoutes);

// Login routes
app.get('/login', (req: Request, res: Response) => {
  res.render('login', { 
    error: null,
    email: ''
  });
});

app.post('/login', validateLoginInput, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout route
app.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Admin routes
app.get('/admin', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await articleService.getArticles();
    res.render('admin-dashboard', {
      articles: articles.data,
      user: req.session.user
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    next(AppError.database('Unable to load admin dashboard'));
  }
});

// Route to create new article
app.get('/admin/article/new', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('create-edit-article', { article: null });
  } catch (err) {
    next(err); 
  }
});

app.post('/admin/article/new', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      throw AppError.validation('Title and content are required');
    }

    const article = await articleService.createArticle({
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    }, req.session.user!.id);

    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

// Route to render the edit article page
app.get('/admin/article/:id/edit', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.id;
    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return next(AppError.notFound('Article not found'));
    }

    res.render('create-edit-article', { 
      user: req.session.user,
      article 
    });
  } catch (error) {
    next(AppError.database('Unable to load edit page'));
  }
});

// Route to update the article
app.put('/admin/article/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.id;
    const { title, content, tags } = req.body;

    if (!title || !content) {
      throw AppError.validation('Title and content are required');
    }

    const updatedArticle = await articleService.updateArticle(articleId, {
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    if (!updatedArticle) {
      return next(AppError.notFound('Article not found'));
    }

    res.redirect('/admin');
  } catch (error) {
    next(AppError.database('Unable to update article'));
  }
});

// Route to delete an article

app.delete('/admin/article/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
      const articleId = req.params.id;

      const article = await articleService.getArticleById(articleId);
      if (!article) {
          return res.status(404).json({ error: 'Article not found' });
      }

      await articleService.deleteArticle(articleId);
      res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
      console.error('Error deleting article:', error);
      next(AppError.database('Unable to delete article'));
  }
});

// Articles listing page
app.get('/articles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const searchParams = {
      search: (req.query.search as string) || null
    };
    
    const result = await articleService.getArticles({
      page,
      search: searchParams.search || undefined
    });
    
    res.format({
      'application/json': () => {
        res.json(result);
      },
      'text/html': () => {
        res.render('home', { 
          articles: result.data,
          searchParams,
          pagination: {
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage
          }
        });
      }
    });
  } catch (error) {
    next(AppError.database('Unable to load articles'));
  }
});

// Home page
app.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const result = await articleService.getArticles({
      page: 1
    });
    
    const publishedArticles = result.data.filter(article => article.status === 'published');
    
    res.format({
      'application/json': () => {
        res.json({
          ...result,
          data: publishedArticles
        });
      },
      'text/html': () => {
        res.render('home', { 
          articles: publishedArticles,
          searchParams: null,
          pagination: {
            total: publishedArticles.length,
            totalPages: Math.ceil(publishedArticles.length / 10),
            currentPage: 1
          }
        });
      }
    });
  } catch (error) {
    next(AppError.database('Unable to load articles'));
  }
});

// Single article page
app.get('/article/:slug', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    if (!article) {
      throw AppError.notFound(ErrorMessages.NOT_FOUND.article);
    }
    
    res.format({
      'application/json': () => {
        res.json(article);
      },
      'text/html': () => {
        res.render('article', { article });
      }
    });
  } catch (error) {
    next(error instanceof AppError ? error : AppError.database('Unable to load article'));
  }
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(AppError.notFound(ErrorMessages.NOT_FOUND.page));
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection established');
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();
