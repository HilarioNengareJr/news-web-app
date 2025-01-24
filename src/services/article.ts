import { pool } from '../db/connection';
import { Article } from '../types';
import slugify from 'slugify';

const ITEMS_PER_PAGE = 9;

export interface SearchParams {
  search?: string;
  page?: number;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getArticles(
  searchParams: Partial<SearchParams> = {}, 
  page: number = 1
): Promise<PaginatedResponse<Article>> {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const offset = skip > 0 ? `OFFSET ${skip}` : '';
  
  let query = `
    SELECT 
      a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
      u.id as "authorId", u.email as "authorEmail"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    ORDER BY a.published_at DESC
    LIMIT ${ITEMS_PER_PAGE} ${offset}
  `;

  const countQuery = `SELECT COUNT(*) FROM articles`;

  if (searchParams?.search) {
    const searchTerm = `%${searchParams.search.toLowerCase()}%`;
    query = `
      SELECT 
        a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
        u.id as "authorId", u.email as "authorEmail"
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE LOWER(a.title) LIKE $1 OR $1 = ANY(a.tags)
      ORDER BY a.published_at DESC
      LIMIT ${ITEMS_PER_PAGE} ${offset}
    `;
  }

  const [articlesResult, countResult] = await Promise.all([
    pool.query<Article>(query, searchParams?.search ? [searchParams.search] : []),
    pool.query<{ count: string }>(countQuery)
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: articlesResult.rows,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const result = await pool.query<Article>(`
    SELECT 
      a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
      u.id as "authorId", u.email as "authorEmail"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    WHERE a.slug = $1
  `, [slug]);

  return result.rows[0] || null;
}

export async function createArticle(
  articleData: Omit<Article, 'id' | 'slug' | 'publishedAt' | 'author'>,
  userId: string
): Promise<Article> {
  const slug = slugify(articleData.title, { lower: true, strict: true });
  
  const result = await pool.query<Article>(`
    INSERT INTO articles 
      (title, slug, content, tags, author_id, published_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING 
      id, title, slug, content, tags, published_at as "publishedAt"
  `, [
    articleData.title,
    slug,
    articleData.content,
    articleData.tags,
    userId
  ]);

  return result.rows[0];
}

export async function updateArticle(
  id: string, 
  articleData: Partial<Article>
): Promise<Article> {
  const result = await pool.query<Article>(`
    UPDATE articles
    SET 
      title = COALESCE($1, title),
      content = COALESCE($2, content),
      tags = COALESCE($3, tags),
      updated_at = NOW()
    WHERE id = $4
    RETURNING 
      id, title, slug, content, tags, published_at as "publishedAt"
  `, [
    articleData.title,
    articleData.content,
    articleData.tags,
    id
  ]);

  return result.rows[0];
}

export async function deleteArticle(id: string): Promise<boolean> {
  await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  return true;
}
