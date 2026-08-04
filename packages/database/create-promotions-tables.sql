-- Migration: Create promotions tables
-- Run: psql $DATABASE_URL -f packages/database/create-promotions-tables.sql

CREATE TYPE promotion_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

CREATE TABLE IF NOT EXISTS promotion (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(64) UNIQUE NOT NULL,
  description VARCHAR(255),
  type promotion_type NOT NULL DEFAULT 'percentage',
  discount_rate NUMERIC(12, 2) NOT NULL,
  min_order_amount NUMERIC(12, 2),
  max_discount_amount NUMERIC(12, 2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS promotion_category (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES product_category(id),
  promotion_id INTEGER NOT NULL REFERENCES promotion(id)
);

CREATE TABLE IF NOT EXISTS promotion_usage (
  id SERIAL PRIMARY KEY,
  promotion_id INTEGER NOT NULL REFERENCES promotion(id),
  user_id VARCHAR(128) NOT NULL,
  order_id INTEGER,
  used_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_promotion_code ON promotion(code);
CREATE INDEX idx_promotion_active ON promotion(is_active, start_date, end_date);
CREATE INDEX idx_promotion_usage_promo ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_user ON promotion_usage(user_id);

-- Insert a sample promotion
INSERT INTO promotion (name, code, description, type, discount_rate, start_date, end_date, is_active)
VALUES (
  'Welcome Discount',
  'WELCOME10',
  '10% off your first order',
  'percentage',
  '10.00',
  '2024-01-01',
  '2026-12-31',
  true
);