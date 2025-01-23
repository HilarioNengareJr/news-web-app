import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import * as db from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError, ErrorMessages } from './utils/errors.js';

// Import routes
import authRoutes from './routes/auth.js';

// Import middleware
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use((req, res, next) => {
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
  secret: process.env.SESSION_SECRET,
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
app.use((req, res, next) => {
  // Only show search on the articles page and not on login or other auth pages
  res.locals.showSearch = req.path === '/articles' && !req.path.startsWith('/login');
  res.locals.isAdmin = !!req.session.user;
  next();
});

// API error handler
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Auth routes
app.use('/', authRoutes);

// Admin routes
app.get('/admin', requireAuth, async (req, res, next) => {
  try {
    const articles = await db.getArticles();
    res.format({
      'application/json': () => {
        res.json(articles);
      },
      'text/html': () => {
        res.render('admin-dashboard', { articles: articles.articles });
      }
    });
  } catch (error) {
    next(AppError.database('Unable to load admin dashboard'));
  }
});

// Articles listing page (moved from home)
app.get('/articles', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const searchParams = {
      search: req.query.search || null
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

// Home page (without search)
app.get('/', async (req, res, next) => {
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

app.get('/article/:slug', async (req, res, next) => {
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
app.use((req, res, next) => {
  next(AppError.notFound(ErrorMessages.NOT_FOUND.page));
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
