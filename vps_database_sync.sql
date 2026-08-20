-- ==============================================================================
-- LANCERS TECH LMS - VPS DATABASE MIGRATION & PEAK SOLUTIONS DATA SYNC
-- Run this SQL file on your VPS MySQL Database (e.g. mysql -u root -p university_lms < vps_database_sync.sql)
-- ==============================================================================

-- 1. Ensure Columns in 'admission_requests'
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS father_cnic VARCHAR(30) NULL AFTER father_name;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS bform_number VARCHAR(30) NULL AFTER dob;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS father_phone VARCHAR(30) NULL AFTER phone;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER email;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Lahore' AFTER address;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS target_class VARCHAR(100) NULL AFTER city;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS last_qualification VARCHAR(150) NULL AFTER target_class;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS admission_fee DECIMAL(10,2) DEFAULT 5000.00 AFTER last_qualification;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS challan_number VARCHAR(50) NULL AFTER admission_fee;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS fee_paid_at TIMESTAMP NULL AFTER status;
ALTER TABLE admission_requests ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER fee_paid_at;

-- 2. Ensure Columns in 'users'
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_cnic VARCHAR(30) NULL AFTER father_name;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bform_number VARCHAR(30) NULL AFTER dob;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admission_number VARCHAR(50) NULL AFTER roll_number;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discount_id INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS net_tuition_fee DECIMAL(10,2) DEFAULT 0.00;

-- 3. Ensure Columns in 'campuses'
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Gulberg, Lahore' AFTER name;

-- 4. Ensure Table 'school_fee_structures'
CREATE TABLE IF NOT EXISTS school_fee_structures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  grade_name VARCHAR(100) NOT NULL,
  tuition_fee DECIMAL(10,2) DEFAULT 0.00,
  admission_fee DECIMAL(10,2) DEFAULT 0.00,
  registration_fee DECIMAL(10,2) DEFAULT 0.00,
  computer_fee DECIMAL(10,2) DEFAULT 0.00,
  transport_fee DECIMAL(10,2) DEFAULT 0.00,
  activity_fee DECIMAL(10,2) DEFAULT 0.00,
  exam_fee DECIMAL(10,2) DEFAULT 0.00,
  lab_fee DECIMAL(10,2) DEFAULT 0.00,
  due_day_of_month INT DEFAULT 10,
  late_fine_per_day DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Ensure Table 'scholarships' (Sibling Discounts & Concessions)
CREATE TABLE IF NOT EXISTS scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  type VARCHAR(50) DEFAULT 'concession',
  percentage DECIMAL(5,2) DEFAULT 0.00,
  description TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Ensure Columns in 'challans'
ALTER TABLE challans ADD COLUMN IF NOT EXISTS month VARCHAR(20) NULL;
ALTER TABLE challans ADD COLUMN IF NOT EXISTS tuition_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE challans ADD COLUMN IF NOT EXISTS transport_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE challans ADD COLUMN IF NOT EXISTS activity_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE challans ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE challans ADD COLUMN IF NOT EXISTS late_fine DECIMAL(10,2) DEFAULT 0.00;

-- ==============================================================================
-- SCHEMA UPDATE COMPLETED SUCCESSFULLY
-- ==============================================================================
