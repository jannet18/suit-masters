# Data Migration Plan for Existing Orders

## Overview

This document outlines the strategy for migrating existing order data to the new tailoring business schema. The migration will be performed in phases to minimize downtime and ensure data integrity.

## Current Data State Analysis

### Tables to Migrate

1. **`shop_order`** - ~X orders (estimate)
2. **`order_item`** - ~Y items (estimate)
3. **JSONB snapshot data** in `order_item` table

### Data Quality Assessment

- ✅ **Measurement data**: Stored in `measurement_snapshot` JSONB
- ✅ **Fabric data**: Stored in `fabric_snapshot` JSONB
- ✅ **Configuration data**: Stored in `configuration_snapshot` JSONB
- ⚠️ **Missing structured relationships**: No foreign keys to product/fabric tables
- ⚠️ **Missing timestamps**: No `created_at`/`updated_at` in `shop_order`

## Migration Phases

### Phase 1: Schema Preparation (Zero Downtime)

**Goal**: Add new columns without breaking existing functionality

```sql
-- Add nullable columns first
ALTER TABLE shop_order
ADD COLUMN created_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN estimated_delivery_date TIMESTAMP,
ADD COLUMN currency VARCHAR(3),
ADD COLUMN tailor_notes TEXT,
ADD COLUMN priority_level VARCHAR(20);

ALTER TABLE order_item
ADD COLUMN product_id INTEGER,
ADD COLUMN fabric_id INTEGER,
ADD COLUMN measurement_profile_id UUID,
ADD COLUMN style_type VARCHAR(50);
```

### Phase 2: Data Backfilling (Background Process)

**Goal**: Populate new columns with existing data

#### Step 2.1: Backfill Timestamps

```sql
-- Set created_at based on order sequence (approximate)
WITH ordered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM shop_order
  WHERE created_at IS NULL
)
UPDATE shop_order so
SET created_at = NOW() - (row_num * INTERVAL '1 hour')
FROM ordered_orders oo
WHERE so.id = oo.id;

-- Set updated_at to match created_at
UPDATE shop_order
SET updated_at = created_at
WHERE updated_at IS NULL;
```

#### Step 2.2: Extract Product IDs from Product Names

```sql
-- Attempt to match product names to existing products
UPDATE order_item oi
SET product_id = p.id
FROM product p
WHERE LOWER(oi.product_name) LIKE LOWER('%' || p.name || '%')
  AND oi.product_id IS NULL
  AND p.name IS NOT NULL;

-- For unmatched items, create placeholder records or leave NULL
```

#### Step 2.3: Extract Fabric IDs from JSONB Snapshots

```sql
-- Extract fabric SKU from fabric_snapshot and match to fabric table
UPDATE order_item oi
SET fabric_id = f.id
FROM fabric f
CROSS JOIN LATERAL jsonb_to_record(oi.fabric_snapshot) AS fs(sku TEXT)
WHERE fs.sku = f.sku
  AND oi.fabric_id IS NULL;

-- Alternative: Extract fabric name
UPDATE order_item oi
SET fabric_id = f.id
FROM fabric f
CROSS JOIN LATERAL jsonb_to_record(oi.fabric_snapshot) AS fs(name TEXT)
WHERE LOWER(fs.name) LIKE LOWER('%' || f.name || '%')
  AND oi.fabric_id IS NULL;
```

### Phase 3: JSONB to Structured Migration (Optional)

**Goal**: Migrate data from JSONB snapshots to structured tables

#### Step 3.1: Migrate Measurement Data

```sql
-- Create batch migration function
CREATE OR REPLACE FUNCTION migrate_measurement_batch(batch_size INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
BEGIN
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
      AND oi.id NOT IN (SELECT order_item_id FROM order_measurement_details)
    LIMIT batch_size;

    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Run migration in batches
-- SELECT migrate_measurement_batch(1000);
-- Repeat until returns 0
```

#### Step 3.2: Migrate Customization Data

```sql
-- Extract style choices from configuration_snapshot
INSERT INTO order_customization (
    order_item_id, customization_type, option_name, option_value
)
SELECT
    oi.id,
    'style' as customization_type,
    'fit' as option_name,
    cs->>'fit' as option_value
FROM order_item oi
CROSS JOIN LATERAL jsonb_to_record(oi.configuration_snapshot) AS cs(fit TEXT)
WHERE cs.fit IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_customization oc
    WHERE oc.order_item_id = oi.id AND oc.customization_type = 'style'
  );

-- Extract lapel style
INSERT INTO order_customization (
    order_item_id, customization_type, option_name, option_value
)
SELECT
    oi.id,
    'lapel' as customization_type,
    'type' as option_name,
    cs->>'lapel' as option_value
FROM order_item oi
CROSS JOIN LATERAL jsonb_to_record(oi.configuration_snapshot) AS cs(lapel TEXT)
WHERE cs.lapel IS NOT NULL;
```

### Phase 4: Data Validation and Cleanup

**Goal**: Ensure data integrity and fix inconsistencies

#### Step 4.1: Validation Queries

```sql
-- Check for orphaned records
SELECT COUNT(*) as orphaned_order_items
FROM order_item oi
LEFT JOIN shop_order so ON oi.order_id = so.id
WHERE so.id IS NULL;

-- Check for invalid measurements
SELECT COUNT(*) as invalid_measurements
FROM order_measurement_details
WHERE unit NOT IN ('cm', 'inch')
   OR chest <= 0 OR chest > 200
   OR waist <= 0 OR waist > 200;

-- Check data completeness
SELECT
    COUNT(*) as total_orders,
    COUNT(created_at) as orders_with_created_at,
    COUNT(estimated_delivery_date) as orders_with_delivery_date,
    ROUND(COUNT(tailor_notes) * 100.0 / COUNT(*), 2) as percent_with_notes
FROM shop_order;
```

#### Step 4.2: Data Cleanup Scripts

```sql
-- Fix invalid unit values
UPDATE order_measurement_details
SET unit = 'cm'
WHERE unit NOT IN ('cm', 'inch');

-- Set default priority for NULL values
UPDATE shop_order
SET priority_level = 'standard'
WHERE priority_level IS NULL;

-- Set default currency
UPDATE shop_order
SET currency = 'USD'
WHERE currency IS NULL;
```

## Migration Timeline

### Day 1: Preparation

- **08:00-10:00**: Backup production database
- **10:00-12:00**: Deploy Phase 1 schema changes
- **12:00-14:00**: Monitor application performance
- **14:00-17:00**: Begin Phase 2 backfilling (batch 1)

### Day 2: Data Migration

- **00:00-06:00**: Run intensive backfilling jobs
- **06:00-09:00**: Validate migrated data
- **09:00-12:00**: Deploy application updates
- **12:00-18:00**: Monitor and fix issues

### Day 3: Optional JSONB Migration

- **00:00-04:00**: Migrate measurement data (if needed)
- **04:00-08:00**: Migrate customization data
- **08:00-12:00**: Final validation
- **12:00-17:00**: Performance optimization

## Risk Mitigation

### High-Risk Scenarios

| Risk                             | Probability | Impact | Mitigation                                 |
| -------------------------------- | ----------- | ------ | ------------------------------------------ |
| Data corruption during migration | Low         | High   | Comprehensive backups, transaction blocks  |
| Application downtime             | Medium      | Medium | Phase deployment, feature flags            |
| Performance degradation          | High        | Medium | Batch processing, off-peak migration       |
| Data inconsistency               | Medium      | High   | Validation scripts, reconciliation process |

### Mitigation Strategies

1. **Incremental Migration**: Migrate in small batches to monitor progress
2. **Feature Flags**: Control new feature rollout in application
3. **Dry Runs**: Test migration on staging environment first
4. **Rollback Plan**: Well-documented rollback procedures
5. **Monitoring**: Real-time monitoring of migration progress

## Rollback Procedures

### Scenario 1: Schema Changes Causing Issues

```sql
-- Remove new columns (data preserved in JSONB snapshots)
ALTER TABLE shop_order
DROP COLUMN created_at,
DROP COLUMN updated_at,
DROP COLUMN estimated_delivery_date,
DROP COLUMN currency,
DROP COLUMN tailor_notes,
DROP COLUMN priority_level;

ALTER TABLE order_item
DROP COLUMN product_id,
DROP COLUMN fabric_id,
DROP COLUMN measurement_profile_id,
DROP COLUMN style_type;
```

### Scenario 2: Data Corruption

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d your_database pre_migration_backup.sql
```

### Scenario 3: Performance Issues

- Disable new features via feature flags
- Remove new indexes temporarily
- Scale database resources

## Success Metrics

### Quantitative Metrics

1. **Data Completeness**: >95% of orders have `created_at` timestamps
2. **Data Accuracy**: <1% data corruption rate
3. **Migration Speed**: <24 hours for full migration
4. **Downtime**: <15 minutes of application unavailability

### Qualitative Metrics

1. **User Experience**: No disruption to customer orders
2. **Admin Experience**: Improved order management capabilities
3. **Developer Experience**: Cleaner, more maintainable schema
4. **Business Value**: Better tailoring workflow support

## Post-Migration Tasks

### Immediate (Day 1)

- [ ] Verify all API endpoints work
- [ ] Test order creation flow
- [ ] Validate admin dashboard displays
- [ ] Check email notifications

### Short-term (Week 1)

- [ ] Monitor database performance
- [ ] Gather user feedback
- [ ] Fix any data inconsistencies
- [ ] Update documentation

### Long-term (Month 1)

- [ ] Analyze tailoring workflow efficiency
- [ ] Optimize queries with new indexes
- [ ] Plan Phase 2 enhancements
- [ ] Train staff on new features

## Communication Plan

### Stakeholders to Notify

1. **Development Team**: Technical details, deployment schedule
2. **Customer Support**: Potential user issues, new features
3. **Management**: Business impact, timeline
4. **Customers**: Service notifications (if downtime expected)

### Communication Timeline

- **1 week before**: Initial notification to team
- **3 days before**: Detailed migration plan shared
- **1 day before**: Final confirmation, backup verification
- **During migration**: Status updates every 2 hours
- **After migration**: Success notification, known issues

## Appendix

### Sample Migration Monitoring Dashboard Queries

```sql
-- Migration progress dashboard
SELECT
    'shop_order' as table_name,
    COUNT(*) as total_records,
    COUNT(created_at) as migrated_records,
    ROUND(COUNT(created_at) * 100.0 / COUNT(*), 2) as migration_percent
FROM shop_order
UNION ALL
SELECT
    'order_item' as table_name,
    COUNT(*) as total_records,
    COUNT(product_id) as migrated_records,
    ROUND(COUNT(product_id) * 100.0 / COUNT(*), 2) as migration_percent
FROM order_item
UNION ALL
SELECT
    'measurement_data' as table_name,
    (SELECT COUNT(*) FROM order_item WHERE measurement_snapshot IS NOT NULL) as total_records,
    COUNT(*) as migrated_records,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM order_item WHERE measurement_snapshot IS NOT NULL), 0), 2) as migration_percent
FROM order_measurement_details;
```

### Emergency Contact List

- **Database Admin**: [Name/Contact]
- **Lead Developer**: [Name/Contact]
- **System Operations**: [Name/Contact]
- **Business Owner**: [Name/Contact]
