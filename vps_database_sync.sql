-- ==============================================================================
-- UNIVERSAL MYSQL MIGRATION SCRIPT (Supports MySQL 5.7, 8.0+, MariaDB)
-- ==============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS AddColumnIfNotExists $$
CREATE PROCEDURE AddColumnIfNotExists(
    IN targetTable VARCHAR(64),
    IN targetColumn VARCHAR(64),
    IN targetDefinition TEXT
)
BEGIN
    SET @dbname = DATABASE();
    SET @col_count = 0;
    
    SELECT COUNT(*) INTO @col_count 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = targetTable 
      AND COLUMN_NAME = targetColumn;
      
    IF @col_count = 0 THEN
        SET @stmt_str = CONCAT('ALTER TABLE `', targetTable, '` ADD COLUMN `', targetColumn, '` ', targetDefinition);
        PREPARE stmt FROM @stmt_str;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

-- 1. Admission Requests Columns
CALL AddColumnIfNotExists('admission_requests', 'father_cnic', 'VARCHAR(30) NULL');
CALL AddColumnIfNotExists('admission_requests', 'bform_number', 'VARCHAR(30) NULL');
CALL AddColumnIfNotExists('admission_requests', 'father_phone', 'VARCHAR(30) NULL');
CALL AddColumnIfNotExists('admission_requests', 'address', 'TEXT NULL');
CALL AddColumnIfNotExists('admission_requests', 'city', "VARCHAR(100) DEFAULT 'Lahore'");
CALL AddColumnIfNotExists('admission_requests', 'target_class', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('admission_requests', 'last_qualification', 'VARCHAR(150) NULL');
CALL AddColumnIfNotExists('admission_requests', 'admission_fee', 'DECIMAL(10,2) DEFAULT 5000.00');
CALL AddColumnIfNotExists('admission_requests', 'challan_number', 'VARCHAR(50) NULL');
CALL AddColumnIfNotExists('admission_requests', 'fee_paid_at', 'TIMESTAMP NULL');
CALL AddColumnIfNotExists('admission_requests', 'notes', 'TEXT NULL');

-- 2. Users Table Columns
CALL AddColumnIfNotExists('users', 'father_cnic', 'VARCHAR(30) NULL');
CALL AddColumnIfNotExists('users', 'bform_number', 'VARCHAR(30) NULL');
CALL AddColumnIfNotExists('users', 'admission_number', 'VARCHAR(50) NULL');
CALL AddColumnIfNotExists('users', 'discount_id', 'INT NULL');
CALL AddColumnIfNotExists('users', 'net_tuition_fee', 'DECIMAL(10,2) DEFAULT 0.00');

-- 3. Campuses Table Columns
CALL AddColumnIfNotExists('campuses', 'location', "VARCHAR(255) DEFAULT 'Gulberg, Lahore'");

-- 4. Challans Table Columns
CALL AddColumnIfNotExists('challans', 'month', 'VARCHAR(20) NULL');
CALL AddColumnIfNotExists('challans', 'tuition_fee', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('challans', 'transport_fee', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('challans', 'activity_fee', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('challans', 'discount_amount', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('challans', 'late_fine', 'DECIMAL(10,2) DEFAULT 0.00');

-- 5. Ensure Table 'school_fee_structures'
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

-- 6. Ensure Table 'scholarships' (Concessions)
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

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
