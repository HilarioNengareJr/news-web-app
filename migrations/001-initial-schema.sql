-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE CHECK (char_length(email) <= 255),
    password_hash TEXT NOT NULL CHECK (char_length(password_hash) <= 255),
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    reset_token TEXT,
    reset_token_expires TIMESTAMP
);

-- Articles Table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (char_length(title) <= 255),
    slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) <= 255),
    excerpt TEXT CHECK (char_length(excerpt) <= 500),
    content TEXT NOT NULL,
    image_url TEXT CHECK (char_length(image_url) <= 2048),
    tags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMP,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_articles_title ON articles USING GIN (to_tsvector('english', title));
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
CREATE INDEX idx_articles_published ON articles (published_at);
CREATE INDEX idx_users_email ON users (email);

-- Tags Table (for normalized tag storage)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 50)
);

-- Article Tags Join Table
CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 1000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Media Table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (char_length(url) <= 2048),
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
