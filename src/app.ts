import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: true,
    })
);

// EJS Templates
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Routes
app.use('/', routes);

export default app;
