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
 * Customer Modules
 */
import { pool } from '../db/connection';
import { Article } from '../types';

/**
 * 
 * @param articleData 
 * @param userId 
 * @returns Promise<Article>
 */
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

  return result.rows[0];
}

/** 
 * 
 * @params id
 * returns Promise<Article | null> 
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const result = await pool.query<Article>(`
    SELECT 
      a.id, a.title, a.slug, a.content, a.tags, a.published_at as "publishedAt",
      u.id as "authorId", u.email as "authorEmail"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    WHERE a.id = $1
  `, [id]);

  return result.rows[0] || null;
}

/**
 * 
 * @param id 
 * @param articleData 
 * @returns Promise<Article>
 */
export async function updateArticle(id: string, articleData: Partial<Article>): Promise<Article> {
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

/**
 * 
 * @params id
 */
export async function deleteArticle(id: string): Promise<void> {
  await pool.query('DELETE FROM articles WHERE id = $1', [id]);
}
