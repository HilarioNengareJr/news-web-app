import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const ITEMS_PER_PAGE = 9;

export async function getArticles(searchParams = null, page = 1) {
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
    articles: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    currentPage: page
  };
}

export async function getArticleBySlug(slug) {
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

export async function createArticle(articleData, userId) {
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

export async function updateArticle(id, articleData) {
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

export async function deleteArticle(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
