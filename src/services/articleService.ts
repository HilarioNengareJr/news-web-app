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
}import { supabase } from '../config/db';
import { Article } from '../types/articleType';

export class ArticleService {
  public async getAllArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw new Error(error.message);
    }
    return data;
  }

  public async searchArticles(query: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .textSearch('title_content', query, {
        type: 'plain',
        config: 'english'
      });

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async createArticle(article: Omit<Article, 'id'>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  public async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  public async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
