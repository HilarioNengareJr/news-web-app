import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import config from '../ormconfig.js';
import { ArticleEntity } from './entities/Article';
import { UserEntity } from './entities/User';
import { PaginatedResponse, Article } from '../types';
import { Article } from '../types';

const ITEMS_PER_PAGE = 9;

// Create a new DataSource instance
export const AppDataSource = new DataSource(config);

export async function initializeDB() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
    return AppDataSource;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export const articleRepository = (): Repository<ArticleEntity> => AppDataSource.getRepository(ArticleEntity);
export const userRepository = (): Repository<UserEntity> => AppDataSource.getRepository(UserEntity);

export interface SearchParams {
  search?: string;
  page?: number;
  tags?: string[];
}

export async function getArticles(
  searchParams: Partial<SearchParams> = {}, 
  page: number = 1
): Promise<PaginatedResponse<Article>> {
  const repo = articleRepository();
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const query = repo.createQueryBuilder('article')
    .leftJoinAndSelect('article.author', 'author')
    .orderBy('article.publishedAt', 'DESC')
    .skip(skip)
    .take(ITEMS_PER_PAGE);

  if (searchParams?.search) {
    const searchTerm = `%${searchParams.search.toLowerCase()}%`;
    query.where(
      'LOWER(article.title) LIKE :search OR article.tags @> ARRAY[:search]',
      { search: searchTerm }
    );
  }

  const [data, total] = await query.getManyAndCount();

  return {
    data,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const repo = articleRepository();
  return repo.findOne({
    where: { slug },
    relations: ['author']
  });
}

export async function createArticle(
  articleData: Omit<Article, 'id' | 'slug' | 'publishedAt' | 'updatedAt' | 'author'>,
  userId: string
): Promise<Article> {
  const repo = articleRepository();
  const user = await userRepository().findOneBy({ id: userId });
  if (!user) {
    throw new Error('User not found');
  }

  const slug = slugify(articleData.title, { lower: true, strict: true });
  const article = repo.create({
    ...articleData,
    slug,
    author: user,
    publishedAt: new Date()
  });

  return repo.save(article);
}

export async function updateArticle(
  id: string, 
  articleData: Partial<Article>
): Promise<Article> {
  const repo = articleRepository();
  await repo.update(id, {
    ...articleData,
    updatedAt: new Date()
  });
  return repo.findOneByOrFail({ id });
}

export async function deleteArticle(id: string): Promise<boolean> {
  const repo = articleRepository();
  await repo.delete(id);
  return true;
}
