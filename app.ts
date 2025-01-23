/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

// Import node modules
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

// Import custom modules
import authRouter from './src/routes/authRoute';
import { articlesRouter } from './src/routes/articles.route';
import { authenticateUser } from './src/middlewares/authUserMiddleware';


dotenv.config();

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
app.use(authenticateUser);

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

/**
 * Error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

/**
 * Start the server
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
