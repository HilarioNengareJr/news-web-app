declare module '*.ejs' {
  const value: (locals: Record<string, any>) => string;
  export default value;
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Represents an article in the system
 */
interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  tags: string[];
  published_at: string;
  updated_at: string;
  author?: {
    email: string;
  };
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
