/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

declare module '*.ejs' {
  const value: (locals: Record<string, any>) => string;
  export default value;
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: 'admin';
    };
  }

  export interface Session {
    user?: {
      id: string;
      email: string;
      role: 'admin';
    };
  }
}

/**
 * Represents an article in the system
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  authorId: string;
  authorEmail: string;
}

/**
 * Represents a paginated response
 * @template T - Type of the data being paginated
 */
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: {
    status: number;
    message: string;
    stack?: string;
  };
}
