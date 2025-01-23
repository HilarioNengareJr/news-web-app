import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { Article, PaginatedResponse } from '../types';

dotenv.config();

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Supabase credentials are missing!');
  process.exit(1);
}

console.log('Connecting to Supabase at:', process.env.SUPABASE_URL);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_KEY
      }
    }
  }
);

// Test connection
(async () => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Supabase connection error:', error);
    process.exit(1);
  }
})();

const ITEMS_PER_PAGE = 9;

interface SearchParams {
  search?: string | null;
}

export async function getArticles(
  searchParams: SearchParams | null = null, 
  page: number = 1
): Promise<PaginatedResponse<Article>> {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('articles')
    .select(`
      *,
      author:profiles(email)
    `, { count: 'exact' })
    .order('published_at', { ascending: false });

  if (searchParams?.search) {
    const searchTerm = searchParams.search.toLowerCase();
    query = query.or(`title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
  }

  query = query.range(start, end);

  const { data, error, count } = await query;
  if (error) throw error;
  
  return {
    data: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    currentPage: page
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(email)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function createArticle(
  articleData: Omit<Article, 'id' | 'slug' | 'published_at' | 'updated_at' | 'author_id'>,
  userId: string
): Promise<Article> {
  const slug = slugify(articleData.title, { lower: true, strict: true });
  
  const { data, error } = await supabase
    .from('articles')
    .insert([{
      ...articleData,
      slug,
      author_id: userId,
      published_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateArticle(
  id: string, 
  articleData: Partial<Article>
): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...articleData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
