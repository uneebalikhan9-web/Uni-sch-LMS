-- ============================================================
-- LMS One-Time Migration Script
-- Run this ONCE on your existing database to add missing columns
-- that were previously being added via ALTER TABLE in route handlers.
-- ============================================================

-- Add reminder tracking columns to finance_challans (if not already present)
ALTER TABLE `finance_challans` 
  ADD COLUMN IF NOT EXISTS `reminder_count` INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `last_reminder_at` DATETIME NULL,
  -- Add missing columns that the API code references but schema didn't have:
  ADD COLUMN IF NOT EXISTS `campus_id` INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `tuition_fee` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `lab_fee` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `library_fee` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `other_fee` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `semester` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `academic_year` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `paid_date` DATE DEFAULT NULL;

-- Add missing columns to finance_payroll
ALTER TABLE `finance_payroll`
  ADD COLUMN IF NOT EXISTS `campus_id` INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `net_payable` DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS `disbursed_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `status` ENUM('pending','disbursed','held') DEFAULT 'pending';

-- Fix finance_challans status ENUM to match what the API uses
-- (Schema had 'unpaid' but API uses 'pending')
ALTER TABLE `finance_challans` 
  MODIFY COLUMN `status` ENUM('pending','paid','overdue','waived','unpaid','cancelled') DEFAULT 'pending';

-- Fix enrollments status ENUM to match what the API uses  
ALTER TABLE `enrollments`
  MODIFY COLUMN `status` ENUM('enrolled','pending','approved','dropped','completed') DEFAULT 'enrolled';

-- Add missing client_id column to users if multi-tenant system is used
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `client_id` INT DEFAULT NULL;

-- Add index on frequently queried columns for performance
ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_users_email` (`email`);
ALTER TABLE `enrollments` ADD INDEX IF NOT EXISTS `idx_enrollments_student` (`student_id`, `course_id`);
ALTER TABLE `attendance` ADD INDEX IF NOT EXISTS `idx_attendance_student_course` (`student_id`, `course_id`, `date`);
ALTER TABLE `chat_messages` ADD INDEX IF NOT EXISTS `idx_chat_sender_receiver` (`sender_id`, `receiver_id`);

-- Create logs directory entry in platform_settings if not exists
INSERT IGNORE INTO `platform_settings` (`setting_key`, `setting_value`, `description`) VALUES
  ('log_retention_days', '30', 'Number of days to retain system log entries');

SELECT 'Migration completed successfully!' AS status;
