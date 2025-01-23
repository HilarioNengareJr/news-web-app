import { supabase } from '../db';
import { Article } from '../types';

export async function initDatabase(): Promise<void> {
  try {
    // Create articles table if it doesn't exist
    const { error: tableError } = await supabase
      .rpc('create_articles_table_if_not_exists');

    if (tableError) throw tableError;

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
