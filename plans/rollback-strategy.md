# Rollback Strategy for Tailoring Schema Migration

## Overview

This document provides a comprehensive rollback strategy for the tailoring business schema migration. The strategy is designed to minimize downtime and data loss in case migration issues arise.

## Rollback Scenarios

### Scenario 1: Schema Migration Failure

**Symptoms**: SQL errors during migration, constraint violations, permission issues
**Time to Detect**: Immediate (during migration execution)
**Impact**: Medium (blocking deployment)

### Scenario 2: Application Compatibility Issues

**Symptoms**: Application errors, API failures, broken functionality
**Time to Detect**: 0-2 hours post-deployment
**Impact**: High (user-facing issues)

### Scenario 3: Performance Degradation

**Symptoms**: Slow queries, high database load, timeout errors
**Time to Detect**: 2-24 hours post-deployment
**Impact**: Medium-High (affects user experience)

### Scenario 4: Data Corruption

**Symptoms**: Missing data, incorrect calculations, reporting errors
**Time to Detect**: 24-72 hours post-deployment
**Impact**: Critical (business operations affected)

## Pre-Migration Preparation

### 1. Database Backups

```bash
# Full database backup
pg_dump -h localhost -U postgres -d suit_masters -F c -b -v -f /backups/pre_migration_full_$(date +%Y%m%d_%H%M%S).backup

# Schema-only backup
pg_dump -h localhost -U postgres -d suit_masters -s -f /backups/pre_migration_schema_$(date +%Y%m%d_%H%M%S).sql

# Critical tables backup
pg_dump -h localhost -U postgres -d suit_masters -t shop_order -t order_item -t user_measurement_profile -f /backups/pre_migration_critical_tables_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Application State Capture

```bash
# Capture current application version
git rev-parse HEAD > /backups/application_version_pre_migration.txt

# Capture environment configuration
env | grep -E "(DATABASE|API|SERVICE)" > /backups/environment_pre_migration.txt

# Capture running processes
ps aux | grep -E "(node|next|npm)" > /backups/processes_pre_migration.txt
```

### 3. Monitoring Baseline

```sql
-- Capture performance baselines
SELECT
    NOW() as capture_time,
    COUNT(*) as total_orders,
    COUNT(DISTINCT user_id) as active_users,
    AVG(total) as avg_order_value
FROM shop_order
WHERE created_at > NOW() - INTERVAL '7 days';

-- Capture index statistics
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('shop_order', 'order_item', 'user_measurement_profile');
```

## Rollback Procedures

### Level 1: Partial Rollback (Schema Only)

**Use when**: New columns/tables causing issues but data intact

```sql
-- Remove new tables (if empty or test data only)
DROP TABLE IF EXISTS order_customization CASCADE;
DROP TABLE IF EXISTS order_fabric_selection CASCADE;
DROP TABLE IF EXISTS order_measurement_details CASCADE;

-- Remove new columns (preserve original data)
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

-- Remove new indexes
DROP INDEX IF EXISTS idx_order_item_product;
DROP INDEX IF EXISTS idx_order_item_fabric;
DROP INDEX IF EXISTS idx_order_item_measurement;
DROP INDEX IF EXISTS idx_order_item_style;
DROP INDEX IF EXISTS idx_order_customization_item;
DROP INDEX IF EXISTS idx_order_fabric_item;
DROP INDEX IF EXISTS idx_order_measurement_item;

-- Remove triggers and functions
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove views
DROP VIEW IF EXISTS tailoring_order_summary;
DROP VIEW IF EXISTS order_measurement_tracking;

-- Remove helper functions
DROP FUNCTION IF EXISTS get_days_until_delivery;
DROP FUNCTION IF EXISTS get_order_timeline;
```

### Level 2: Full Schema Rollback

**Use when**: Multiple schema changes causing issues

```sql
-- Complete schema rollback script
BEGIN;

-- Drop all new tables
DROP TABLE IF EXISTS order_customization CASCADE;
DROP TABLE IF EXISTS order_fabric_selection CASCADE;
DROP TABLE IF EXISTS order_measurement_details CASCADE;

-- Remove all new columns from shop_order
ALTER TABLE shop_order
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at,
DROP COLUMN IF EXISTS estimated_delivery_date,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS tailor_notes,
DROP COLUMN IF EXISTS priority_level;

-- Remove all new columns from order_item
ALTER TABLE order_item
DROP COLUMN IF EXISTS product_id,
DROP COLUMN IF EXISTS fabric_id,
DROP COLUMN IF EXISTS measurement_profile_id,
DROP COLUMN IF EXISTS style_type;

-- Remove all new indexes
DROP INDEX IF EXISTS idx_order_item_product;
DROP INDEX IF EXISTS idx_order_item_fabric;
DROP INDEX IF EXISTS idx_order_item_measurement;
DROP INDEX IF EXISTS idx_order_item_style;
DROP INDEX IF EXISTS idx_order_customization_item;
DROP INDEX IF EXISTS idx_order_fabric_item;
DROP INDEX IF EXISTS idx_order_measurement_item;

-- Remove all triggers and functions
DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove all views
DROP VIEW IF EXISTS tailoring_order_summary;
DROP VIEW IF EXISTS order_measurement_tracking;

-- Remove all helper functions
DROP FUNCTION IF EXISTS get_days_until_delivery;
DROP FUNCTION IF EXISTS get_order_timeline;

-- Remove new enum values (if possible)
-- Note: Removing enum values is complex, may need to recreate type
-- ALTER TYPE order_status DROP VALUE 'measurement_taken';

COMMIT;
```

### Level 3: Database Restoration

**Use when**: Data corruption or critical failures

```bash
# Stop application services
systemctl stop your-application-service

# Restore from backup
pg_restore -h localhost -U postgres -d suit_masters --clean --if-exists /backups/pre_migration_full_$(date).backup

# Verify restoration
psql -h localhost -U postgres -d suit_masters -c "SELECT COUNT(*) FROM shop_order;"

# Restart application services
systemctl start your-application-service
```

### Level 4: Application Rollback

**Use when**: Application code incompatible with new schema

```bash
# Revert to previous application version
git checkout $(cat /backups/application_version_pre_migration.txt)

# Reinstall dependencies
npm ci

# Restart application
pm2 restart all

# Verify application health
curl -f http://localhost:3000/api/health
```

## Rollback Decision Matrix

| Issue Severity                   | Detection Time | Recommended Rollback                      | Estimated Downtime |
| -------------------------------- | -------------- | ----------------------------------------- | ------------------ |
| Critical errors during migration | Immediate      | Level 3 (Database Restoration)            | 15-30 minutes      |
| Application failing to start     | 0-15 minutes   | Level 4 (Application Rollback)            | 5-10 minutes       |
| Broken functionality             | 15-60 minutes  | Level 2 (Full Schema Rollback)            | 2-5 minutes        |
| Performance issues               | 1-24 hours     | Level 1 (Partial Rollback)                | 1-2 minutes        |
| Data inconsistencies             | 24+ hours      | Investigate first, then Level 3 if needed | 15-30 minutes      |

## Rollback Validation

### Post-Rollback Checks

1. **Database Integrity**

```sql
-- Verify table structures
SELECT
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('shop_order', 'order_item', 'user_measurement_profile')
GROUP BY table_name;

-- Verify data counts
SELECT
    'shop_order' as table_name,
    COUNT(*) as record_count
FROM shop_order
UNION ALL
SELECT
    'order_item' as table_name,
    COUNT(*) as record_count
FROM order_item
UNION ALL
SELECT
    'user_measurement_profile' as table_name,
    COUNT(*) as record_count
FROM user_measurement_profile;
```

2. **Application Functionality**

```bash
# Test critical endpoints
curl -f http://localhost:3000/api/orders
curl -f http://localhost:3000/api/products
curl -f http://localhost:3000/api/cart

# Test database connectivity
node -e "const { Pool } = require('pg'); const pool = new Pool(); pool.query('SELECT 1').then(() => console.log('DB OK')).catch(e => console.error('DB Error:', e));"
```

3. **Performance Baseline**

```sql
-- Compare with pre-migration baseline
EXPLAIN ANALYZE SELECT * FROM shop_order WHERE status = 'pending' ORDER BY id DESC LIMIT 10;
EXPLAIN ANALYZE SELECT * FROM order_item WHERE order_id IN (SELECT id FROM shop_order WHERE status = 'processing');
```

## Communication Plan During Rollback

### Internal Communication

1. **Immediate Notification** (Slack/Teams): "@channel ROLLBACK INITIATED - Tailoring schema migration"
2. **Status Updates**: Every 5 minutes during rollback
3. **Completion Notification**: "ROLLBACK COMPLETE - System restored to pre-migration state"
4. **Post-Mortem Schedule**: "Incident review scheduled for [time]"

### External Communication (if needed)

```markdown
# Service Notification Template

**Subject**: Service Restoration Notice

Dear Customer,

We experienced technical difficulties during a scheduled system upgrade.
Our team has successfully restored service to its previous state.

- **Issue**: Database migration encountered unexpected errors
- **Action Taken**: Rolled back to stable version
- **Current Status**: All services operational
- **Impact**: Minimal downtime experienced
- **Next Steps**: We will reschedule the upgrade with additional testing

We apologize for any inconvenience and appreciate your patience.

Best regards,
The Technical Team
```

## Rollback Timeline Estimates

### Best Case (Level 1 Rollback)

- **Decision Time**: 5 minutes
- **Execution Time**: 2 minutes
- **Validation Time**: 3 minutes
- **Total Downtime**: 10 minutes

### Typical Case (Level 2 Rollback)

- **Decision Time**: 10 minutes
- **Execution Time**: 5 minutes
- **Validation Time**: 5 minutes
- **Total Downtime**: 20 minutes

### Worst Case (Level 3 Rollback)

- **Decision Time**: 15 minutes
- **Execution Time**: 15 minutes
- **Validation Time**: 10 minutes
- **Total Downtime**: 40 minutes

## Prevention Measures

### To Avoid Needing Rollback

1. **Comprehensive Testing**
   - Unit tests for new schema
   - Integration tests with application
   - Load testing with production-like data
   - Staging environment mirroring production

2. **Gradual Deployment**
   - Feature flags for new functionality
   - Canary deployment to subset of users
   - A/B testing for critical paths
   - Monitoring before full rollout

3. **Data Safety**
   - Transaction blocks for all migrations
   - Data validation before and after
   - Point-in-time recovery capability
   - Regular backup verification

4. **Team Preparedness**
   - Rollback drills before migration
   - Clear decision-making authority
   - Documented runbooks
   - Communication protocols established

## Post-Rollback Analysis

### Incident Report Template

```markdown
# Rollback Incident Report

## Incident Summary

- **Date/Time**: [When rollback occurred]
- **Duration**: [How long rollback took]
- **Trigger**: [What caused the need for rollback]
- **Impact**: [Affected systems/users]

## Root Cause Analysis

1. **Primary Cause**: [Main technical issue]
2. **Contributing Factors**: [Additional issues]
3. **Detection Gap**: [Why wasn't this caught earlier?]

## Rollback Execution

- **Rollback Level**: [1, 2, 3, or 4]
- **Execution Time**: [Actual vs estimated]
- **Issues Encountered**: [Problems during rollback]
- **Data Loss**: [Any data affected?]

## Lessons Learned

1. **What went well**: [Positive aspects]
2. **What to improve**: [Areas for enhancement]
3. **Action Items**: [Concrete steps to prevent recurrence]

## Follow-up Actions

- [ ] Schedule retry with fixes
- [ ] Update testing procedures
- [ ] Enhance monitoring
- [ ] Update documentation
```

## Emergency Contacts

### Technical Contacts

| Role             | Name   | Phone   | Slack  |
| ---------------- | ------ | ------- | ------ |
| Database Admin   | [Name] | [Phone] | @slack |
| Lead Developer   | [Name] | [Phone] | @slack |
| DevOps Engineer  | [Name] | [Phone] | @slack |
| System Architect | [Name] | [Phone] | @slack |

### Business Contacts

| Role                  | Name   | Phone   | Email   |
| --------------------- | ------ | ------- | ------- |
| Product Manager       | [Name] | [Phone] | [Email] |
| Customer Support Lead | [Name] | [Phone] | [Email] |
| Business Owner        | [Name] | [Phone] | [Email] |

## Appendix

### Rollback Scripts Location

- **Level 1**: `/scripts/rollback/partial_rollback.sql`
- **Level 2**: `/scripts/rollback/full_rollback.sql`
- **Level 3**: `/scripts/restore/from_backup.sh`
- **Level 4**: `/scripts/application/rollback.sh`

### Monitoring Dashboard URLs

- **Database Health**: https://grafana.example.com/database
- **Application Metrics**: https://grafana.example.com/application
- **Business Metrics**: https://grafana.example.com/business
- **Migration Progress**: https://grafana.example.com/migration

### Backup Verification Commands

```bash
# Verify backup integrity
pg_restore -l /backups/pre_migration_full_*.backup | head -20

# Test restore on temporary database
createdb -h localhost -U postgres test_restore
pg_restore -h localhost -U postgres -d test_restore /backups/pre_migration_full_*.backup
dropdb -h localhost -U postgres test_restore
```
