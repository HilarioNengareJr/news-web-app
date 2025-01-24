import { createConnection } from 'typeorm';
import { ArticleEntity } from '../entities/Article';
import { UserEntity } from '../entities/User';
import { Article } from '../types/index.js';
import bcrypt from 'bcryptjs';
import config from '../ormconfig';
import slugify from 'slugify';

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
        content: 'Web development has evolved significantly over the years. From static HTML pages to dynamic, interactive web applications, the landscape has changed dramatically. Modern frameworks like React, Angular, and Vue.js have revolutionized how we build user interfaces.',
        tags: ['web', 'development', 'javascript'],
        authorId: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'The Future of AI in Software Engineering',
        content: 'Artificial Intelligence is transforming the software industry. From automated code generation to intelligent debugging tools, AI is helping developers work more efficiently. Machine learning models are being integrated into applications at an unprecedented rate.',
        tags: ['ai', 'software', 'machine-learning'],
        authorId: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'Best Practices for Database Design',
        content: 'Proper database design is crucial for building scalable applications. Normalization, indexing, and proper schema design can make or break an application\'s performance. Understanding ACID properties and transaction management is essential for any developer working with databases.',
        tags: ['database', 'design', 'sql'],
        authorId: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'TypeScript: The Future of JavaScript Development',
        content: 'TypeScript has become an essential tool for modern JavaScript development. With its strong typing system and excellent tooling support, it helps catch errors early and improves code maintainability. Many large-scale projects are now adopting TypeScript as their primary language.',
        tags: ['typescript', 'javascript', 'web'],
        authorId: '00000000-0000-0000-0000-000000000001'
      },
      {
        title: 'Building RESTful APIs with Node.js',
        content: 'Node.js has become a popular choice for building RESTful APIs due to its non-blocking I/O model and vast ecosystem. With frameworks like Express.js, developers can quickly create scalable and maintainable APIs. Proper error handling and security considerations are crucial when building production-ready APIs.',
        tags: ['nodejs', 'api', 'rest'],
        authorId: '00000000-0000-0000-0000-000000000001'
      }
    ];

    const articleRepo = connection.getRepository(ArticleEntity);
    const userRepo = connection.getRepository(UserEntity);
    
    // Create admin user if not exists
    let adminUser = await userRepo.findOneBy({ email: 'admin@news.com' });
    if (!adminUser) {
      adminUser = userRepo.create({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@news.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      await userRepo.save(adminUser);
    }

    // Create sample articles
    for (const article of sampleArticles) {
      const existingArticle = await articleRepo.findOneBy({ title: article.title });
      if (!existingArticle) {
        const newArticle = articleRepo.create({
          ...article,
          slug: slugify(article.title, { lower: true, strict: true }),
          author: adminUser,
          publishedAt: new Date(),
          updatedAt: new Date()
        });
        await articleRepo.save(newArticle);
      }
    }

    console.log('Successfully initialized database with sample articles');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during database initialization');
  }
}
