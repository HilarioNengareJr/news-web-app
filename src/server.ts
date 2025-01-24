import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { pool } from './db/connection';
import * as userService from './entities/User';
import { errorHandler } from './middleware/error.middleware';
import { AppError, ErrorMessages } from './utils/errors';
import { Article } from './types';
import { articleService } from './services/article.service';

// Import routes
import authRoutes from './routes/auth.routes';
import { authService } from '../services/auth.service';

// Import middleware
import { requireAuth } from './middleware/auth.middleware';

/**
 * Extend express-session types with custom session data
 */
// This declaration is now in src/types/index.d.ts

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test database connection
await pool.query('SELECT NOW()');
console.log('Database connection established');

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Security middleware
/**
 * Security middleware to set HTTP headers
 */
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
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

// View engine setup
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Add middleware to determine if search should be shown
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.showSearch = req.path === '/articles' && !req.path.startsWith('/login');
  res.locals.isAdmin = !!req.session.user;
  next();
});

// API error handler
app.use('/api', (err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!(err instanceof Error)) {
    err = new Error('Unknown error occurred');
  }
  console.error(err);
  res.status(500).json({
    error: {
      message: err.message || 'Internal server error',
      status: 500
    }
  });
});

// Auth routes
app.use('/', authRoutes);

// Admin routes
app.get('/admin', requireAuth, async (req, res, next) => {
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

// Article creation route
app.post('/articles', requireAuth, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Articles listing page
app.get('/articles', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const searchParams = {
      search: (req.query.search as string) || null
    };
    
    const articles = await articleService.getArticles({
      page,
      search: searchParams.search || undefined
    });
    
    res.format({
      'application/json': () => {
        res.json(articles);
      },
      'text/html': () => {
        res.render('home', { 
          articles,
          searchParams,
          pagination: {
            total: articles.total,
            totalPages: articles.totalPages,
            currentPage: articles.currentPage
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
    const articles = await articleService.getArticles({
      page: 1
    });
    res.format({
      'application/json': () => {
        res.json(articles);
      },
      'text/html': () => {
        res.render('home', { 
          articles,
          searchParams: null,
          pagination: {
            total: articles.total,
            totalPages: articles.totalPages,
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
    // Test database connection
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
