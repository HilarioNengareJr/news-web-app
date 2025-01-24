declare module '*.ejs' {
  const value: (locals: Record<string, any>) => string;
  export default value;
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: 'user' | 'admin';
      isAdmin?: boolean;
    };
  }

  export interface Session {
    user?: {
      id: string;
      email: string;
      role: 'user' | 'admin';
      isAdmin?: boolean;
    };
  }
}

interface AdminStats {
  totalArticles: number;
  totalUsers: number;
  recentArticles: Article[];
  recentUsers: User[];
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
  updatedAt?: Date;
  author?: {
    id: string;
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
