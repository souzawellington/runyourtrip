-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS category_id INTEGER,
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS image_thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS grid_view_image_url TEXT,
ADD COLUMN IF NOT EXISTS trending_score INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE NOT NULL;

-- Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_category_id ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_price ON templates(price);
CREATE INDEX IF NOT EXISTS idx_templates_trending_score ON templates(trending_score);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    template_id INTEGER NOT NULL,
    seller_id VARCHAR NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    transaction_id TEXT UNIQUE,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    purchase_date TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_template_id ON purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_template_purchase ON purchases(user_id, template_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    template_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_template_id ON reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_template_review ON reviews(user_id, template_id);