# Tailoring Business Schema Migration Plan

## Current State Analysis

### Database Schema (from migration `0000_colossal_morbius.sql`)

**shop_order table:**

- Basic order fields: `id`, `user_id`, `total`, `status`
- Shipping fields as separate columns (not JSONB)
- Missing: `created_at`, `updated_at`, `currency`, `estimated_delivery_date`, `tailor_notes`

**order_item table:**

- `fabric_snapshot`, `configuration_snapshot`, `measurement_snapshot` as JSONB
- Missing: `product_id` foreign key, `fabric_id` foreign key, `measurement_profile_id` reference

**user_measurement_profile table:**

- Comprehensive measurement fields exist
- Proper unit support (`cm` or `inch`)

### Schema Inconsistencies

1. **`packages/database/src/schema/index.ts`** defines different structure than actual database
2. **`packages/database/src/schema/orders.ts`** has different table definitions
3. Need to reconcile which schema is correct

## Migration Goals

### Phase 1: Critical Improvements (Week 1)

1. Add missing timestamp fields to `shop_order`
2. Add foreign key relationships to `order_item`
3. Extend `order_status` enum for tailoring workflow
4. Add `tailor_notes` field

### Phase 2: Data Integrity (Week 2)

1. Migrate shipping columns to JSONB structure
2. Create structured customization tables
3. Add validation constraints
4. Backfill missing data

### Phase 3: Advanced Features (Week 3)

1. Measurement versioning system
2. Fabric inventory tracking
3. Tailor assignment system
4. Production timeline tracking

## Detailed Migration Steps

### Step 1: Update `order_status` Enum

```sql
-- First, check if enum exists and add new values
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'measurement_taken';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pattern_cutting';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'sewing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'fitting_session';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'alterations';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'quality_control';
```

### Step 2: Add Missing Columns to `shop_order`

```sql
-- Add timestamp columns
ALTER TABLE shop_order
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tailor_notes TEXT,
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'standard';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shop_order_updated_at
    BEFORE UPDATE ON shop_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Enhance `order_item` Table

```sql
-- Add foreign key columns
ALTER TABLE order_item
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES product(id),
ADD COLUMN IF NOT EXISTS fabric_id INTEGER REFERENCES fabric(id),
ADD COLUMN IF NOT EXISTS measurement_profile_id UUID REFERENCES user_measurement_profile(id),
ADD COLUMN IF NOT EXISTS style_type VARCHAR(50);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_item_product ON order_item(product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_fabric ON order_item(fabric_id);
CREATE INDEX IF NOT EXISTS idx_order_item_measurement ON order_item(measurement_profile_id);
```

### Step 4: Create Structured Customization Tables

```sql
-- Table for order-specific customizations
CREATE TABLE order_customization (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id),
    customization_type VARCHAR(50) NOT NULL, -- 'style', 'lapel', 'buttons', 'lining', etc.
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    price_impact NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table for fabric selections with details
CREATE TABLE order_fabric_selection (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id),
    fabric_id INTEGER NOT NULL REFERENCES fabric(id),
    color VARCHAR(50),
    pattern VARCHAR(50),
    quantity_yards NUMERIC(8,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table for structured measurements
CREATE TABLE order_measurement_details (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id),
    unit VARCHAR(5) NOT NULL DEFAULT 'cm',
    height NUMERIC(5,2),
    chest NUMERIC(5,2),
    waist NUMERIC(5,2),
    hips NUMERIC(5,2),
    inseam NUMERIC(5,2),
    shoulder NUMERIC(5,2),
    sleeve NUMERIC(5,2),
    neck NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5: Data Migration Strategy

**For existing orders:**

1. Extract data from JSONB snapshots
2. Transform into structured tables
3. Preserve original JSONB for audit trail
4. Run in batches to avoid downtime

```sql
-- Example: Migrate measurement data from JSONB to structured table
INSERT INTO order_measurement_details (
    order_item_id, unit, height, chest, waist, hips, inseam, shoulder
)
SELECT
    oi.id,
    COALESCE(ms->>'unit', 'cm'),
    (ms->>'height')::NUMERIC,
    (ms->>'chest')::NUMERIC,
    (ms->>'waist')::NUMERIC,
    (ms->>'hips')::NUMERIC,
    (ms->>'inseam')::NUMERIC,
    (ms->>'shoulder')::NUMERIC
FROM order_item oi
CROSS JOIN LATERAL jsonb_to_record(oi.measurement_snapshot) AS ms(unit TEXT, height TEXT, chest TEXT, waist TEXT, hips TEXT, inseam TEXT, shoulder TEXT)
WHERE oi.measurement_snapshot IS NOT NULL;
```

## Rollback Strategy

### Pre-Migration Backup

```bash
# Create database backup
pg_dump -h localhost -U postgres -d your_database -f pre_migration_backup.sql

# Backup specific tables
pg_dump -h localhost -U postgres -d your_database -t shop_order -t order_item -f orders_backup.sql
```

### Rollback Steps

1. **If migration fails mid-way:**
   - Restore from backup
   - Drop newly created tables
   - Remove added columns

2. **Rollback SQL:**

```sql
-- Remove new tables
DROP TABLE IF EXISTS order_customization;
DROP TABLE IF EXISTS order_fabric_selection;
DROP TABLE IF EXISTS order_measurement_details;

-- Remove added columns
ALTER TABLE shop_order
DROP COLUMN IF EXISTS estimated_delivery_date,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS tailor_notes,
DROP COLUMN IF EXISTS priority_level;

ALTER TABLE order_item
DROP COLUMN IF EXISTS product_id,
DROP COLUMN IF EXISTS fabric_id,
DROP COLUMN IF EXISTS measurement_profile_id,
DROP COLUMN IF EXISTS style_type;

-- Remove trigger
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Testing Strategy

### 1. Unit Tests

- Test new column additions
- Test foreign key constraints
- Test trigger functionality

### 2. Integration Tests

- Test order creation with new fields
- Test measurement data migration
- Test API endpoints with updated schema

### 3. Performance Tests

- Benchmark queries with new indexes
- Test data migration performance
- Monitor database load during migration

## Implementation Timeline

### Day 1-2: Preparation

- Review and finalize migration scripts
- Create backup procedures
- Set up staging environment

### Day 3: Schema Changes

- Apply Phase 1 changes (non-breaking)
- Test in staging
- Update TypeScript definitions

### Day 4: Data Migration

- Run data migration scripts
- Validate data integrity
- Performance testing

### Day 5: Deployment

- Deploy to production during low-traffic window
- Monitor application performance
- Have rollback plan ready

## TypeScript Schema Updates

Update `packages/database/src/schema/index.ts`:

```typescript
// Enhanced shopOrder
export const shopOrder = pgTable("shop_order", {
  // ... existing fields ...
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  tailorNotes: text("tailor_notes"),
  priorityLevel: varchar("priority_level", { length: 20 }).default("standard"),
});

// Enhanced orderItem
export const orderItem = pgTable("order_item", {
  // ... existing fields ...
  productId: integer("product_id").references(() => product.id),
  fabricId: integer("fabric_id").references(() => fabric.id),
  measurementProfileId: uuid("measurement_profile_id").references(
    () => userMeasurementProfile.id,
  ),
  styleType: varchar("style_type", { length: 50 }),
});
```

## Risk Assessment & Mitigation

| Risk                       | Probability | Impact | Mitigation                             |
| -------------------------- | ----------- | ------ | -------------------------------------- |
| Data loss during migration | Low         | High   | Comprehensive backups, test in staging |
| Application downtime       | Medium      | Medium | Schedule during low-traffic hours      |
| Performance degradation    | Low         | Medium | Index optimization, query tuning       |
| Schema inconsistency       | Medium      | High   | Validate TypeScript vs database schema |

## Success Metrics

1. **Zero data loss** during migration
2. **< 5 minutes** of application downtime
3. **100% data integrity** post-migration
4. **Improved query performance** for common operations
5. **Successful migration** of all existing orders

## Next Steps

1. **Review this plan** with development team
2. **Set up staging environment** for testing
3. **Create detailed runbook** for production deployment
4. **Schedule migration window** with stakeholders
5. **Prepare monitoring** for post-migration validation
