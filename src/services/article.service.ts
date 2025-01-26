/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

/**
 * Node Modules
 */
import slugify from 'slugify';


/**
 * Custom Modules
 */
import { pool } from '../db/connection';
import { Article, PaginatedResponse } from '../types';

const ITEMS_PER_PAGE = 10;

/**
 * Service article
 */
export const articleService = {
  async getArticles(options: { 
    page?: number; 
    search?: string 
  } = {}) {
    const page = options.page || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;

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
    const params = [];

    if (options.search) {
      query += ` WHERE LOWER(a.title) LIKE $1 OR $1 = ANY(a.tags)`;
      params.push(`%${options.search.toLowerCase()}%`);
    }

    query += `
      ORDER BY a.published_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    params.push(ITEMS_PER_PAGE, offset);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM articles a`;
    if (options.search) {
      countQuery += ` WHERE LOWER(a.title) LIKE $1 OR $1 = ANY(a.tags)`;
    }

    const [articlesResult, countResult] = await Promise.all([
      pool.query<Article>(query, params),
      pool.query<{ count: string }>(countQuery, options.search ? [params[0]] : [])
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return {
      data: articlesResult.rows,
      total,
      totalPages,
      currentPage: page
    };
  },

  /**
   * 
   * @param slug 
   * @returns 
   */
  async getArticleBySlug(slug: string) {
    const result = await pool.query<Article>(`
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
      WHERE a.slug = $1
    `, [slug]);

    return result.rows[0] || null;
  },

  /**
   * 
   * @param articleData 
   * @param authorId 
   * @returns 
   */
  async createArticle(articleData: {
    title: string;
    content: string;
    tags: string[];
    excerpt?: string;
    image_url?: string;
    status?: string;
  }, authorId: string) {
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
      articleData.excerpt || '',
      articleData.content,
      articleData.image_url || '',
      articleData.tags,
      articleData.status || 'draft',
      authorId
    ]);

    return result.rows[0];
  },

 /**
  * 
  * @param id 
  * @param articleData 
  * @returns 
  */
  async updateArticle(
    id: string, 
    articleData: Partial<Article>
  ) {
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
      WHERE id = $7
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
        (SELECT email FROM users WHERE id = author_id) as "authorEmail"
    `, [
      articleData.title,
      articleData.excerpt,
      articleData.content,
      articleData.image_url,
      articleData.tags,
      articleData.status,
      id
    ]);

    return result.rows[0];
  },

  /**
   * 
   * @param articleId 
   */
  async deleteArticle(articleId: string) {
    const query = 'DELETE FROM articles WHERE id = $1';
    await pool.query(query, [articleId]);
},

/**
 * 
 * @param articleId 
 * @returns 
 */
  async getArticleById(articleId: string) {
      const query = 'SELECT * FROM articles WHERE id = $1';
      const { rows } = await pool.query(query, [articleId]);
      return rows[0] || null;
  },
};
