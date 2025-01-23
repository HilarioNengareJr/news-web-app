/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

// Import node modules
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import { supabase } from './src/config/db';

// Import custom modules
import authRouter from './src/routes/authRoute';
import { articlesRouter } from './src/routes/articlesRoute';
import { isAuthenticated } from './src/middlewares/authUserMiddleware';


dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Performance middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

/**
 * EJS settings
 */
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/src/views`);

/**
 * Set static directory
 */
app.use(express.static(`${__dirname}/public`));

/**
 * Enable middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
  })
);

/* 
* Authentication routes 
*/
app.use('/auth', authRouter);

/** 
* Middleware to check if the user is authenticated
*/ 
app.use(isAuthenticated);

/**
 * Public routes for viewing news articles
 */
app.use('/articles', articlesRouter);

/** 
 * Home page route 
 */ 
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'News App Home' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, 'Not Found'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    }
  });
});

/**
 * Start the server
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
