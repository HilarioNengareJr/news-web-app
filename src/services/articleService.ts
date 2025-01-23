import { supabase } from '../config/db';
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
