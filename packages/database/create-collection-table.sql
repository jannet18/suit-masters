-- 1. Drop the old broken versions
DROP TABLE IF EXISTS product_collection CASCADE;
DROP TABLE IF EXISTS collection CASCADE;
DROP TABLE IF EXISTS measurement_definitions CASCADE;
-- Create collection table
CREATE TABLE IF NOT EXISTS collection (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create product_collection junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_collection (
  product_id INTEGER NOT NULL REFERENCES product(id),
  collection_id INTEGER NOT NULL REFERENCES collection(id),
  PRIMARY KEY (product_id, collection_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collection_slug ON collection(slug);
CREATE INDEX IF NOT EXISTS idx_product_collection_product_id ON product_collection(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collection_collection_id ON product_collection(collection_id);