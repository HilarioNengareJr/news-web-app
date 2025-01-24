-- First get the admin user ID
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get the admin user ID (assuming one exists)
  SELECT id INTO admin_id FROM users LIMIT 1;
  
  -- If no users exist, create one
  IF admin_id IS NULL THEN
    INSERT INTO users (email, password_hash, role) VALUES (
      'admin@example.com',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
      'admin'
    ) RETURNING id INTO admin_id;
  END IF;

  -- Insert dummy articles
  INSERT INTO articles (id, title, slug, excerpt, content, image_url, tags, status, author_id, published_at) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'The Future of Football Analytics',
    'future-of-football-analytics',
    'Exploring how data is revolutionizing the beautiful game',
    'Football analytics has come a long way...',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    ARRAY['analytics', 'technology', 'football'],
    'published',
    admin_id,
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Top 5 Young Players to Watch',
    'top-5-young-players',
    'A look at the rising stars of world football',
    'The world of football is always looking for...',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
    ARRAY['players', 'youth', 'scouting'],
    'published',
    admin_id,
    NOW() - INTERVAL '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Understanding Expected Goals (xG)',
    'understanding-expected-goals',
    'Breaking down one of football''s most important metrics',
    'Expected Goals (xG) has become...',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
    ARRAY['analytics', 'metrics', 'xG'],
    'published',
    admin_id,
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'The Evolution of Football Tactics',
    'evolution-of-football-tactics',
    'How the game has changed over the decades',
    'From the WM formation to gegenpressing...',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf',
    ARRAY['tactics', 'history', 'formation'],
    'published',
    admin_id,
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Data-Driven Scouting: The New Frontier',
    'data-driven-scouting',
    'How clubs are using data to find the next big talent',
    'In the modern game, scouting has become...',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    ARRAY['scouting', 'analytics', 'recruitment'],
    'draft',
    admin_id,
    NOW() - INTERVAL '4 days'
  );

  -- Insert some tags
  INSERT INTO tags (name) VALUES
  ('analytics'),
  ('technology'),
  ('football'),
  ('players'),
  ('youth'),
  ('scouting'),
  ('metrics'),
  ('xG'),
  ('tactics'),
  ('history'),
  ('formation'),
  ('recruitment')
  ON CONFLICT (name) DO NOTHING;

  -- Link articles to tags
  INSERT INTO article_tags (article_id, tag_id)
  SELECT a.id, t.id
  FROM articles a
  JOIN tags t ON t.name = ANY(a.tags)
  ON CONFLICT DO NOTHING;
END $$;
