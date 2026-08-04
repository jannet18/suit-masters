-- Migration: Add tracking columns to shop_order table
-- Run: psql $DATABASE_URL -f packages/database/add-tracking-columns.sql

ALTER TABLE shop_order
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(128),
  ADD COLUMN IF NOT EXISTS tracking_carrier VARCHAR(64);