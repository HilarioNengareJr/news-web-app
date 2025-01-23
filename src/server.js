import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import * as db from './db';
import { initDatabase } from './db/init';
import { errorHandler } from './middleware/errorHandler';
import { AppError, ErrorMessages } from './utils/errors';

// Import routes
import authRoutes from './routes/auth';

// Import middleware
import { requireAuth } from './middleware/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Security middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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
  secret: process.env.SESSION_SECRET as string,
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
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.showSearch = req.path === '/articles' && !req.path.startsWith('/login');
  res.locals.isAdmin = !!req.session.user;
  next();
});

// API error handler
app.use('/api', (err: Error, req: Request, res: Response, next: NextFunction) => {
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
app.get('/admin', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await db.getArticles();
    res.format({
      'application/json': () => {
        res.json(articles);
      },
      'text/html': () => {
        res.render('admin-dashboard', { articles: articles.data });
      }
    });
  } catch (error) {
    next(AppError.database('Unable to load admin dashboard'));
  }
});

// Articles listing page
app.get('/articles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const searchParams = {
      search: (req.query.search as string) || null
    };
    
    const articles = await db.getArticles(searchParams, page);
    
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
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await db.getArticles(null, 1);
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
app.get('/article/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await db.getArticleBySlug(req.params.slug);
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
    await initDatabase();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();
