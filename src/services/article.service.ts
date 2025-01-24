import { pool } from '../db/connection.js';
import { Article, PaginatedResponse } from '../types/index.js';
import slugify from 'slugify';

const ITEMS_PER_PAGE = 9;

export interface SearchParams {
  search?: string;
  page?: number;
  tags?: string[];
}

export async function getArticles(
  searchParams: Partial<SearchParams> = {}, 
  page: number = 1
): Promise<PaginatedResponse<Article>> {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const offset = skip > 0 ? skip : 0;
  
  let query = `
    SELECT 
      a.id, 
      a.title, 
      a.slug, 
      a.excerpt,
      a.content,
      a.image_url,
      a.tags, 
      a.status,
      a.published_at as "publishedAt",
      a.updated_at as "updatedAt",
      u.id as "authorId", 
      u.email as "authorEmail"
    FROM articles a
    JOIN users u ON a.author_id = u.id
  `;

  const params: (string | number)[] = [];
  let paramCount = 1;

  if (searchParams?.search) {
    query += ` WHERE LOWER(a.title) LIKE $${paramCount} OR $${paramCount} = ANY(a.tags)`;
    params.push(`%${searchParams.search.toLowerCase()}%`);
    paramCount++;
  }

  query += `
    ORDER BY a.published_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  params.push(ITEMS_PER_PAGE, offset);

  const countQuery = `
    SELECT COUNT(*) 
    FROM articles a
    ${searchParams?.search ? 'WHERE LOWER(a.title) LIKE $1 OR $1 = ANY(a.tags)' : ''}
  `;

  const [articlesResult, countResult] = await Promise.all([
    pool.query<Article>(query, params),
    pool.query<{ count: string }>(countQuery, searchParams?.search ? [params[0]] : [])
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
      (title, slug, excerpt, content, image_url, tags, status, author_id, published_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING 
      id, 
      title, 
      slug, 
      excerpt,
      content,
      image_url,
      tags, 
      status,
      published_at as "publishedAt",
      (SELECT email FROM users WHERE id = $8) as "authorEmail"
  `, [
    articleData.title,
    slug,
    articleData.content,
    articleData.tags,
    userId
  ]);

  return {
    ...result.rows[0],
    authorId: userId
  };
}

export async function updateArticle(
  id: string, 
  articleData: Partial<Article>
): Promise<Article> {
  const result = await pool.query<Article>(`
    UPDATE articles
    SET 
      title = COALESCE($1, title),
      excerpt = COALESCE($2, excerpt),
      content = COALESCE($3, content),
      image_url = COALESCE($4, image_url),
      tags = COALESCE($5, tags),
      status = COALESCE($6, status),
      updated_at = NOW()
    WHERE id = $4
    RETURNING 
      id, 
      title, 
      slug, 
      content, 
      tags, 
      published_at as "publishedAt",
      author_id as "authorId",
      (SELECT email FROM users WHERE id = author_id) as "authorEmail"
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
import { pool } from '../db/connection';
import { Article } from '../types';

export const articleService = {
  async getArticles(options: { 
    page?: number; 
    search?: string 
  } = {}) {
    const page = options.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
        u.id as "authorId", u.email as "authorEmail"
      FROM articles a
      JOIN users u ON a.author_id = u.id
    `;
    const params = [];

    if (options.search) {
      query += ` WHERE a.title ILIKE $1 OR a.content ILIKE $1`;
      params.push(`%${options.search}%`);
    }

    query += `
      ORDER BY a.published_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const articles = await pool.query<Article>(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM articles`;
    if (options.search) {
      countQuery += ` WHERE title ILIKE $1 OR content ILIKE $1`;
    }
    const countResult = await pool.query<{ count: string }>(countQuery, 
      options.search ? [`%${options.search}%`] : []
    );

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: articles.rows,
      total,
      totalPages,
      currentPage: page
    };
  },

  async getArticleBySlug(slug: string) {
    const result = await pool.query<Article>(`
      SELECT 
        a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
        u.id as "authorId", u.email as "authorEmail"
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.slug = $1
    `, [slug]);

    return result.rows[0] || null;
  },

  async createArticle(articleData: {
    title: string;
    content: string;
    tags: string[];
  }, authorId: string) {
    const result = await pool.query<Article>(`
      INSERT INTO articles 
        (title, content, tags, author_id, published_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING 
        id, title, slug, content, tags, published_at as "publishedAt"
    `, [
      articleData.title,
      articleData.content,
      articleData.tags,
      authorId
    ]);

    return result.rows[0];
  }
};
