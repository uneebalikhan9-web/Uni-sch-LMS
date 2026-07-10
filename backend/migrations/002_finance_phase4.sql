-- ============================================================
-- Phase 4 Finance Integration Migration
-- Adds discount_amount to finance_challans table
-- ============================================================

ALTER TABLE `finance_challans`
  ADD COLUMN IF NOT EXISTS `discount_amount` DECIMAL(12,2) DEFAULT 0.00 AFTER total_amount;
