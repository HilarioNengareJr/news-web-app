/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

// Import node modules
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';

// Import custom modules
import authRouter from './src/routes/auth.route';
import articlesRouter from './src/routes/articles.route';
import adminRouter from './src/routes/admin.route';
import authenticateUser from './src/middlewares/auth_user.middleware';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

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
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
  })
);

/**
 * Routes for the news application
 */

// Authentication routes
app.use('/auth', authRouter);

// Middleware to check if the user is authenticated
app.use(authenticateUser);

// Admin routes for managing news articles
app.use('/admin', adminRouter);

// Public routes for viewing news articles
app.use('/articles', articlesRouter);

// Home page route
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'News App Home' });
});

/**
 * Error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
