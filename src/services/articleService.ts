import { pool } from '../data/db';
import { Article } from '../types/articleType';

export class ArticleService {
  public async getAllArticles(): Promise<Article[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM articles ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch articles');
    }
  }

  public async getArticleById(id: string): Promise<Article | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM articles WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch article');
    }
  }

  public async searchArticles(query: string): Promise<Article[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM articles WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC',
        [`%${query}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to search articles');
    }
  }
}