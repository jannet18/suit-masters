-- Minimal migration to add missing columns to shop_order table
-- This adds only the essential columns needed for MVP

-- Add timestamp columns
ALTER TABLE shop_order 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tailor_notes TEXT;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
CREATE TRIGGER update_shop_order_updated_at 
    BEFORE UPDATE ON shop_order 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES product(id),
ADD COLUMN IF NOT EXISTS fabric_id INTEGER REFERENCES fabric(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_fabric ON order_items(fabric_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_created ON shop_order(created_at);
CREATE INDEX IF NOT EXISTS idx_shop_order_status ON shop_order(status);

-- Update existing orders with created_at (use current timestamp)
UPDATE shop_order SET created_at = NOW() WHERE created_at IS NULL;
UPDATE shop_order SET updated_at = NOW() WHERE updated_at IS NULL;

-- Verify the changes
SELECT 'Migration completed successfully' as result;