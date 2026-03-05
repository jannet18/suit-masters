-- Tailoring Business Schema Migration Scripts
-- Phase 1: Critical Improvements

-- ============================================
-- STEP 1: Update order_status enum
-- ============================================

-- Check if enum exists and add new tailoring-specific statuses
DO $$ 
BEGIN
    -- Check if the enum type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        -- Add new values if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'measurement_taken'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'measurement_taken';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'pattern_cutting'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'pattern_cutting';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'sewing'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'sewing';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'fitting_session'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'fitting_session';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'alterations'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'alterations';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = 'order_status'::regtype 
            AND enumlabel = 'quality_control'
        ) THEN
            ALTER TYPE order_status ADD VALUE 'quality_control';
        END IF;
    END IF;
END $$;

-- ============================================
-- STEP 2: Add missing columns to shop_order
-- ============================================

-- Add timestamp and tailoring-specific columns
ALTER TABLE shop_order 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tailor_notes TEXT,
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'standard';

-- Create or replace function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
CREATE TRIGGER update_shop_order_updated_at 
    BEFORE UPDATE ON shop_order 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 3: Enhance order_item table
-- ============================================

-- Add foreign key columns for better data integrity
ALTER TABLE order_item
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES product(id),
ADD COLUMN IF NOT EXISTS fabric_id INTEGER REFERENCES fabric(id),
ADD COLUMN IF NOT EXISTS measurement_profile_id UUID REFERENCES user_measurement_profile(id),
ADD COLUMN IF NOT EXISTS style_type VARCHAR(50);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_item_product ON order_item(product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_fabric ON order_item(fabric_id);
CREATE INDEX IF NOT EXISTS idx_order_item_measurement ON order_item(measurement_profile_id);
CREATE INDEX IF NOT EXISTS idx_order_item_style ON order_item(style_type);

-- ============================================
-- STEP 4: Create structured customization tables
-- ============================================

-- Table for order-specific customizations (style choices)
CREATE TABLE IF NOT EXISTS order_customization (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
    customization_type VARCHAR(50) NOT NULL CHECK (customization_type IN ('style', 'lapel', 'buttons', 'lining', 'pocket', 'vent', 'shoulder', 'fit')),
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    price_impact NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique customization per order item
    UNIQUE(order_item_id, customization_type)
);

-- Table for fabric selections with details
CREATE TABLE IF NOT EXISTS order_fabric_selection (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
    fabric_id INTEGER NOT NULL REFERENCES fabric(id),
    color VARCHAR(50),
    pattern VARCHAR(50),
    quantity_yards NUMERIC(8,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(order_item_id, fabric_id)
);

-- Table for structured measurements (alternative to JSONB)
CREATE TABLE IF NOT EXISTS order_measurement_details (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
    unit VARCHAR(5) NOT NULL DEFAULT 'cm' CHECK (unit IN ('cm', 'inch')),
    height NUMERIC(5,2),
    chest NUMERIC(5,2),
    waist NUMERIC(5,2),
    hips NUMERIC(5,2),
    inseam NUMERIC(5,2),
    shoulder NUMERIC(5,2),
    sleeve NUMERIC(5,2),
    neck NUMERIC(5,2),
    back_length NUMERIC(5,2),
    bicep NUMERIC(5,2),
    forearm NUMERIC(5,2),
    thigh NUMERIC(5,2),
    calf NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(order_item_id)
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_order_customization_item ON order_customization(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_fabric_item ON order_fabric_selection(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_measurement_item ON order_measurement_details(order_item_id);

-- ============================================
-- STEP 5: Data migration for existing orders
-- ============================================

-- Migrate measurement data from JSONB to structured table (optional)
-- This can be run separately after schema changes are verified
/*
INSERT INTO order_measurement_details (
    order_item_id, unit, height, chest, waist, hips, inseam, shoulder,
    sleeve, neck, back_length, bicep, forearm, thigh, calf
)
SELECT 
    oi.id,
    COALESCE(ms->>'unit', 'cm'),
    NULLIF(ms->>'height', '')::NUMERIC,
    NULLIF(ms->>'chest', '')::NUMERIC,
    NULLIF(ms->>'waist', '')::NUMERIC,
    NULLIF(ms->>'hips', '')::NUMERIC,
    NULLIF(ms->>'inseam', '')::NUMERIC,
    NULLIF(ms->>'shoulder', '')::NUMERIC,
    NULLIF(ms->>'sleeve', '')::NUMERIC,
    NULLIF(ms->>'neck', '')::NUMERIC,
    NULLIF(ms->>'back_length', '')::NUMERIC,
    NULLIF(ms->>'bicep', '')::NUMERIC,
    NULLIF(ms->>'forearm', '')::NUMERIC,
    NULLIF(ms->>'thigh', '')::NUMERIC,
    NULLIF(ms->>'calf', '')::NUMERIC
FROM order_item oi
CROSS JOIN LATERAL jsonb_to_record(oi.measurement_snapshot) AS ms(
    unit TEXT, height TEXT, chest TEXT, waist TEXT, hips TEXT, 
    inseam TEXT, shoulder TEXT, sleeve TEXT, neck TEXT,
    back_length TEXT, bicep TEXT, forearm TEXT, thigh TEXT, calf TEXT
)
WHERE oi.measurement_snapshot IS NOT NULL
AND oi.id NOT IN (SELECT order_item_id FROM order_measurement_details);
*/

-- ============================================
-- STEP 6: Update existing data (backfill)
-- ============================================

-- Set created_at for existing orders (use a reasonable default)
UPDATE shop_order 
SET created_at = NOW() - INTERVAL '1 day'
WHERE created_at IS NULL;

-- Update order_item with product_id from product_name (if possible)
-- This is a simplified example - adjust based on your actual data
/*
UPDATE order_item oi
SET product_id = p.id
FROM product p
WHERE LOWER(oi.product_name) LIKE LOWER(p.name || '%')
AND oi.product_id IS NULL;
*/

-- ============================================
-- STEP 7: Create views for reporting
-- ============================================

-- View for tailoring order dashboard
CREATE OR REPLACE VIEW tailoring_order_summary AS
SELECT 
    so.id AS order_id,
    so.status,
    so.created_at,
    so.estimated_delivery_date,
    so.priority_level,
    COUNT(oi.id) AS item_count,
    SUM(oi.quantity) AS total_quantity,
    so.total AS order_total,
    so.tailor_notes
FROM shop_order so
LEFT JOIN order_item oi ON so.id = oi.order_id
GROUP BY so.id, so.status, so.created_at, so.estimated_delivery_date, 
         so.priority_level, so.total, so.tailor_notes
ORDER BY so.priority_level DESC, so.created_at DESC;

-- View for measurement tracking
CREATE OR REPLACE VIEW order_measurement_tracking AS
SELECT 
    oi.id AS order_item_id,
    so.id AS order_id,
    p.name AS product_name,
    omd.unit,
    omd.chest,
    omd.waist,
    omd.hips,
    omd.inseam,
    omd.shoulder,
    omd.created_at AS measurement_taken_at,
    CASE 
        WHEN omd.id IS NOT NULL THEN 'structured'
        WHEN oi.measurement_snapshot IS NOT NULL THEN 'jsonb'
        ELSE 'missing'
    END AS measurement_type
FROM order_item oi
JOIN shop_order so ON oi.order_id = so.id
LEFT JOIN product p ON oi.product_id = p.id
LEFT JOIN order_measurement_details omd ON oi.id = omd.order_item_id;

-- ============================================
-- STEP 8: Create helper functions
-- ============================================

-- Function to calculate remaining days until delivery
CREATE OR REPLACE FUNCTION get_days_until_delivery(order_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    delivery_date TIMESTAMP;
BEGIN
    SELECT estimated_delivery_date INTO delivery_date
    FROM shop_order WHERE id = order_id;
    
    IF delivery_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN DATE_PART('day', delivery_date - NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to get order timeline
CREATE OR REPLACE FUNCTION get_order_timeline(order_id INTEGER)
RETURNS TABLE(
    status order_status,
    entered_at TIMESTAMP,
    days_in_status INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH status_changes AS (
        -- This assumes you have an order_status_history table
        -- For now, we'll use created_at as placeholder
        SELECT 
            so.status,
            so.created_at AS entered_at,
            DATE_PART('day', NOW() - so.created_at) AS days_in_status
        FROM shop_order so
        WHERE so.id = order_id
        UNION ALL
        -- Add future status tracking logic here
        SELECT 
            'estimated_delivery'::order_status,
            so.estimated_delivery_date,
            NULL
        FROM shop_order so
        WHERE so.id = order_id
        AND so.estimated_delivery_date IS NOT NULL
    )
    SELECT * FROM status_changes
    ORDER BY entered_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Check new columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shop_order'
ORDER BY ordinal_position;

-- Check new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('order_customization', 'order_fabric_selection', 'order_measurement_details')
ORDER BY table_name;

-- Verify trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'shop_order';

-- Check data integrity
SELECT 
    COUNT(*) AS total_orders,
    COUNT(created_at) AS orders_with_created_at,
    COUNT(updated_at) AS orders_with_updated_at,
    COUNT(estimated_delivery_date) AS orders_with_delivery_date
FROM shop_order;

-- ============================================
-- ROLLBACK SCRIPT (Keep for emergency use)
-- ============================================
/*
-- Remove new tables
DROP TABLE IF EXISTS order_customization;
DROP TABLE IF EXISTS order_fabric_selection;
DROP TABLE IF EXISTS order_measurement_details;

-- Remove added columns
ALTER TABLE shop_order 
DROP COLUMN IF EXISTS estimated_delivery_date,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS tailor_notes,
DROP COLUMN IF EXISTS priority_level,
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;

ALTER TABLE order_item
DROP COLUMN IF EXISTS product_id,
DROP COLUMN IF EXISTS fabric_id,
DROP COLUMN IF EXISTS measurement_profile_id,
DROP COLUMN IF EXISTS style_type;

-- Remove indexes
DROP INDEX IF EXISTS idx_order_item_product;
DROP INDEX IF EXISTS idx_order_item_fabric;
DROP INDEX IF EXISTS idx_order_item_measurement;
DROP INDEX IF EXISTS idx_order_item_style;

-- Remove trigger and function
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
DROP FUNCTION IF EXISTS update_updated_at_column;

-- Remove views
DROP VIEW IF EXISTS tailoring_order_summary;
DROP VIEW IF EXISTS order_measurement_tracking;

-- Remove functions
DROP FUNCTION IF EXISTS get_days_until_delivery;
DROP FUNCTION IF EXISTS get_order_timeline;
*/
