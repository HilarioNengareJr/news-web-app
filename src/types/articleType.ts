/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  author: string;
  slug: string;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
