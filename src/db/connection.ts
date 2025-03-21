/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

/**
 * Node Modules
 */
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

/**
 * Environment variables configuration
 */
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Testing the connection
 */
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
