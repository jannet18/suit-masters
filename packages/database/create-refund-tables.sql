-- Migration: Create refund/return tables
-- Run: psql $DATABASE_URL -f packages/database/create-refund-tables.sql

CREATE TYPE refund_status AS ENUM ('requested', 'approved', 'processing', 'completed', 'rejected');
CREATE TYPE return_reason AS ENUM ('wrong_size', 'defective', 'not_as_described', 'changed_mind', 'late_delivery', 'other');

CREATE TABLE IF NOT EXISTS refund_request (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES shop_order(id),
  user_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'requested',
  reason VARCHAR(64) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  refund_amount NUMERIC(12, 2),
  stripe_refund_id VARCHAR(128),
  admin_notes TEXT,
  processed_by VARCHAR(128),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS refund_timeline (
  id SERIAL PRIMARY KEY,
  refund_request_id INTEGER NOT NULL REFERENCES refund_request(id),
  action VARCHAR(64) NOT NULL,
  notes TEXT,
  performed_by VARCHAR(128),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_refund_request_order_id ON refund_request(order_id);
CREATE INDEX idx_refund_request_user_id ON refund_request(user_id);
CREATE INDEX idx_refund_request_status ON refund_request(status);
CREATE INDEX idx_refund_timeline_refund_id ON refund_timeline(refund_request_id);