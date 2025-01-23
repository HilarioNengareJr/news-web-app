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

  export interface Session {
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
export interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  authorId: string;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
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
