import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { Article } from './entities/Article';

export async function initializeDB() {
  return createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'enviolata79',
    database: process.env.DB_NAME || 'news_db',
    entities: [User, Article],
    synchronize: true,
    logging: true
  });
}
