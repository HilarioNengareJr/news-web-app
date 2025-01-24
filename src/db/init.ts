import { createConnection } from 'typeorm';
import { ArticleEntity } from '../entities/Article';
import { UserEntity } from '../entities/User';
import { Article } from '../types/index.js';
import bcrypt from 'bcryptjs';
import config from '../ormconfig';

/**
 * Initializes the database by creating tables and inserting sample data if needed
 * @throws {Error} If database initialization fails
 */
export async function initDatabase(): Promise<void> {
  try {
    // Create articles table if it doesn't exist
    // Initialize TypeORM connection
    const connection = await createConnection(config);
    console.log('Database connection established');

    // Add default admin user if not exists
    const defaultAdmin = {
      email: 'admin@news.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    };

    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', defaultAdmin.email)
      .single();

    if (!existingAdmin) {
      const userRepo = connection.getRepository(UserEntity);
      const adminUser = userRepo.create({
        email: defaultAdmin.email,
        passwordHash: defaultAdmin.password,
        role: defaultAdmin.role
      });
      await userRepo.save(adminUser);
      console.log('Default admin user created');
    }

    // Check if we already have articles
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('*')
      .limit(1);

    if (existingArticles && existingArticles.length > 0) {
      console.log('Database already contains articles');
      return;
    }

    // Add sample articles
    const sampleArticles: Omit<Article, 'id' | 'slug' | 'publishedAt' | 'updatedAt' | 'author'>[] = [
      {
        title: 'Introduction to Modern Web Development',
        content: 'Web development has evolved significantly...',
        tags: ['web', 'development'],
        author_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'The Future of AI in Software Engineering',
        content: 'Artificial Intelligence is transforming...',
        tags: ['ai', 'software'],
        author_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'Best Practices for Database Design',
        content: 'Proper database design is crucial...',
        tags: ['database', 'design'],
        author_id: '00000000-0000-0000-0000-000000000001'
      }
    ];

    const articleRepo = connection.getRepository(ArticleEntity);
    for (const article of sampleArticles) {
      const newArticle = articleRepo.create({
        ...article,
        author: { id: '00000000-0000-0000-0000-000000000001' },
        publishedAt: new Date()
      });
      await articleRepo.save(newArticle);
    }

    console.log('Successfully initialized database with sample articles');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during database initialization');
  }
}
