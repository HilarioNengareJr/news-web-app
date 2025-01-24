import { supabase } from '../db';
import { Article } from '../types';
import bcrypt from 'bcryptjs';

/**
 * Initializes the database by creating tables and inserting sample data if needed
 * @throws {Error} If database initialization fails
 */
export async function initDatabase(): Promise<void> {
  try {
    // Create articles table if it doesn't exist
    const { error: tableError } = await supabase
      .rpc('create_articles_table_if_not_exists');

    if (tableError) throw tableError;

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
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          email: defaultAdmin.email,
          password_hash: defaultAdmin.password,
          role: defaultAdmin.role
        }]);

      if (userError) throw userError;
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
    const sampleArticles: Partial<Article>[] = [
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

    const { error: insertError } = await supabase
      .from('articles')
      .insert(sampleArticles);

    if (insertError) throw insertError;

    console.log('Successfully initialized database with sample articles');
  } catch (error: unknown) {
    console.error('Error initializing database:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during database initialization');
  }
}
