# Schema Updates for Tailoring Business

## SQL Migration Scripts

### Phase 1: Critical Improvements

```sql
-- Update order_status enum with tailoring-specific statuses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'measurement_taken') THEN
            ALTER TYPE order_status ADD VALUE 'measurement_taken';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'pattern_cutting') THEN
            ALTER TYPE order_status ADD VALUE 'pattern_cutting';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'sewing') THEN
            ALTER TYPE order_status ADD VALUE 'sewing';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'fitting_session') THEN
            ALTER TYPE order_status ADD VALUE 'fitting_session';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'alterations') THEN
            ALTER TYPE order_status ADD VALUE 'alterations';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'order_status'::regtype AND enumlabel = 'quality_control') THEN
            ALTER TYPE order_status ADD VALUE 'quality_control';
        END IF;
    END IF;
END $$;

-- Add missing columns to shop_order
ALTER TABLE shop_order
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tailor_notes TEXT,
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'standard';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shop_order_updated_at ON shop_order;
CREATE TRIGGER update_shop_order_updated_at
    BEFORE UPDATE ON shop_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enhance order_item table
ALTER TABLE order_item
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES product(id),
ADD COLUMN IF NOT EXISTS fabric_id INTEGER REFERENCES fabric(id),
ADD COLUMN IF NOT EXISTS measurement_profile_id UUID REFERENCES user_measurement_profile(id),
ADD COLUMN IF NOT EXISTS style_type VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_item_product ON order_item(product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_fabric ON order_item(fabric_id);
CREATE INDEX IF NOT EXISTS idx_order_item_measurement ON order_item(measurement_profile_id);
CREATE INDEX IF NOT EXISTS idx_order_item_style ON order_item(style_type);
```

### Phase 2: Structured Customization Tables

```sql
-- Order customization table
CREATE TABLE IF NOT EXISTS order_customization (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
    customization_type VARCHAR(50) NOT NULL CHECK (customization_type IN ('style', 'lapel', 'buttons', 'lining', 'pocket', 'vent', 'shoulder', 'fit')),
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    price_impact NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(order_item_id, customization_type)
);

-- Fabric selection table
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

-- Structured measurements table
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

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_order_customization_item ON order_customization(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_fabric_item ON order_fabric_selection(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_measurement_item ON order_measurement_details(order_item_id);
```

## TypeScript Schema Updates

### Update `packages/database/src/schema/index.ts`

```typescript
// Enhanced orderStatusEnum with tailoring-specific statuses
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "production",
  "quality_check",
  "shipped",
  "delivered",
  "cancelled",
  // Tailoring-specific statuses
  "measurement_taken",
  "pattern_cutting",
  "sewing",
  "fitting_session",
  "alterations",
  "quality_control",
]);

// Enhanced shopOrder table
export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => siteUsers.id),
  status: orderStatusEnum("status").default("pending"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  shippingName: varchar("shipping_name", { length: 255 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  tailorNotes: text("tailor_notes"),
  priorityLevel: varchar("priority_level", { length: 20 }).default("standard"),
});

// Enhanced orderItem table
export const orderItem = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => shopOrder.id)
    .notNull(),
  productId: integer("product_id").references(() => product.id),
  fabricId: integer("fabric_id").references(() => fabric.id),
  measurementProfileId: uuid("measurement_profile_id").references(
    () => userMeasurementProfile.id,
  ),
  productName: varchar("product_name", { length: 255 }).notNull(),
  fabricSnapshot: jsonb("fabric_snapshot").notNull(),
  configurationSnapshot: jsonb("configuration_snapshot").notNull(),
  measurementSnapshot: jsonb("measurement_snapshot").notNull(),
  styleType: varchar("style_type", { length: 50 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

// New structured customization tables
export const orderCustomization = pgTable("order_customization", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id")
    .references(() => orderItem.id, { onDelete: "cascade" })
    .notNull(),
  customizationType: varchar("customization_type", { length: 50 })
    .$type<
      | "style"
      | "lapel"
      | "buttons"
      | "lining"
      | "pocket"
      | "vent"
      | "shoulder"
      | "fit"
    >()
    .notNull(),
  optionName: varchar("option_name", { length: 100 }).notNull(),
  optionValue: varchar("option_value", { length: 255 }).notNull(),
  priceImpact: numeric("price_impact", { precision: 12, scale: 2 }).default(
    "0.00",
  ),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderFabricSelection = pgTable("order_fabric_selection", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id")
    .references(() => orderItem.id, { onDelete: "cascade" })
    .notNull(),
  fabricId: integer("fabric_id")
    .references(() => fabric.id)
    .notNull(),
  color: varchar("color", { length: 50 }),
  pattern: varchar("pattern", { length: 50 }),
  quantityYards: numeric("quantity_yards", { precision: 8, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderMeasurementDetails = pgTable("order_measurement_details", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id")
    .references(() => orderItem.id, { onDelete: "cascade" })
    .notNull(),
  unit: varchar("unit", { length: 5 })
    .$type<"cm" | "inch">()
    .notNull()
    .default("cm"),
  height: numeric("height", { precision: 5, scale: 2 }),
  chest: numeric("chest", { precision: 5, scale: 2 }),
  waist: numeric("waist", { precision: 5, scale: 2 }),
  hips: numeric("hips", { precision: 5, scale: 2 }),
  inseam: numeric("inseam", { precision: 5, scale: 2 }),
  shoulder: numeric("shoulder", { precision: 5, scale: 2 }),
  sleeve: numeric("sleeve", { precision: 5, scale: 2 }),
  neck: numeric("neck", { precision: 5, scale: 2 }),
  backLength: numeric("back_length", { precision: 5, scale: 2 }),
  bicep: numeric("bicep", { precision: 5, scale: 2 }),
  forearm: numeric("forearm", { precision: 5, scale: 2 }),
  thigh: numeric("thigh", { precision: 5, scale: 2 }),
  calf: numeric("calf", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update relations
export const shopOrderRelations = relations(shopOrder, ({ one, many }) => ({
  user: one(siteUsers, {
    fields: [shopOrder.userId],
    references: [siteUsers.id],
  }),
  items: many(orderItem),
  // Add new relations
  customizations: many(orderCustomization, {
    relationName: "order_customizations",
  }),
  fabricSelections: many(orderFabricSelection, {
    relationName: "order_fabric_selections",
  }),
  measurementDetails: many(orderMeasurementDetails, {
    relationName: "order_measurement_details",
  }),
}));

export const orderItemRelations = relations(orderItem, ({ one, many }) => ({
  order: one(shopOrder, {
    fields: [orderItem.orderId],
    references: [shopOrder.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
  fabric: one(fabric, {
    fields: [orderItem.fabricId],
    references: [fabric.id],
  }),
  measurementProfile: one(userMeasurementProfile, {
    fields: [orderItem.measurementProfileId],
    references: [userMeasurementProfile.id],
  }),
  // New relations
  customizations: many(orderCustomization),
  fabricSelections: many(orderFabricSelection),
  measurementDetails: many(orderMeasurementDetails),
}));
```

### Update `packages/database/src/schema/orders.ts` (if used)

If you're using the separate `orders.ts` file, update it similarly:

```typescript
// Add new fields to shopOrder
export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 64 }).notNull(),

  // Shipping snapshot
  shipping_name: varchar("shipping_name", { length: 255 }).notNull(),
  shipping_email: varchar("shipping_email", { length: 255 }).notNull(),
  shipping_phone: varchar("shipping_phone", { length: 32 }).notNull(),
  shipping_address_line1: varchar("shipping_address_line1", {
    length: 255,
  }).notNull(),
  shipping_address_line2: varchar("shipping_address_line2", { length: 255 }),
  shipping_city: varchar("shipping_city", { length: 128 }).notNull(),
  shipping_region: varchar("shipping_region", { length: 128 }).notNull(),
  shipping_postal_code: varchar("shipping_postal_code", {
    length: 16,
  }).notNull(),
  shipping_country: varchar("shipping_country", { length: 64 }).notNull(),

  // New tailoring fields
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  estimated_delivery_date: timestamp("estimated_delivery_date"),
  tailor_notes: text("tailor_notes"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  priority_level: varchar("priority_level", { length: 20 }).default("standard"),
});
```

## Data Migration Plan

### Step 1: Backfill Timestamps

```sql
-- Set created_at for existing orders
UPDATE shop_order
SET created_at = NOW() - INTERVAL '1 day'
WHERE created_at IS NULL;

-- Set updated_at to match created_at for existing orders
UPDATE shop_order
SET updated_at = created_at
WHERE updated_at IS NULL;
```

### Step 2: Extract Data from JSONB Snapshots

```sql
-- Migrate measurement data (optional - can be done incrementally)
INSERT INTO order_measurement_details (
    order_item_id, unit, height, chest, waist, hips, inseam, shoulder
)
SELECT
    oi.id,
    COALESCE(ms->>'unit', 'cm'),
    NULLIF(ms->>'height', '')::NUMERIC,
    NULLIF(ms->>'chest', '')::NUMERIC,
    NULLIF(ms->>'width', '')::NUMERIC,
    NULLIF(ms->>'hips', '')::NUMERIC,
    NULLIF(ms->>'inseam', '')::NUMERIC,
    NULLIF(ms->>'shoulder', '')::NUMERIC
FROM order_item oi
CROSS JOIN LATERAL jsonb_to_record(oi.measurement_snapshot) AS ms(
    unit TEXT, height TEXT, chest TEXT, width TEXT, hips TEXT, inseam TEXT, shoulder TEXT
)
WHERE oi.measurement_snapshot IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM order_measurement_details omd
    WHERE omd.order_item_id = oi.id
);
```

### Step 3: Update Application Code

1. Update API endpoints to use new fields
2. Modify order creation to include tailoring-specific data
3. Update admin dashboard to show new statuses
4. Add validation for measurement data

## Rollback Strategy

### Emergency Rollback SQL

```sql
-- Remove new tables
DROP TABLE IF EXISTS order_customization;
DROP TABLE IF EXISTS order_fabric_selection;
DROP TABLE IF EXISTS order_measurement_details;

-- Remove added columns (keep original data)
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
```

## Testing Checklist

### Pre-Migration Tests

- [ ] Backup database
- [ ] Test migration in staging environment
- [ ] Verify SQL scripts don't break existing functionality
- [ ] Test rollback procedure

### Post-Migration Tests

- [ ] Verify new columns exist
- [ ] Test order creation with new fields
- [ ] Test measurement data migration
- [ ] Verify API endpoints work with updated schema
- [ ] Test admin dashboard with new statuses
- [ ] Performance test with new indexes

### Application Tests

- [ ] Update TypeScript types
- [ ] Test frontend configurator with new schema
- [ ] Verify cart functionality
- [ ] Test checkout process
- [ ] Validate email notifications with new fields
