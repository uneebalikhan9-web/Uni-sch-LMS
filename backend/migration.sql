-- =========================================================
-- LancersTech LMS - Complete Database Migration Script
-- Compatible with MySQL 5.7+
-- Safe to run multiple times
-- =========================================================

-- Use stored procedure approach for safe column addition

DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DELIMITER //
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(128),
    IN columnName VARCHAR(128),
    IN columnDef TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND COLUMN_NAME = columnName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- =========================================================
-- 1. CHAT MESSAGES - Add edit/delete/read columns
-- =========================================================
CALL AddColumnIfNotExists('chat_messages', 'is_edited', 'TINYINT(1) DEFAULT 0');
CALL AddColumnIfNotExists('chat_messages', 'is_deleted', 'TINYINT(1) DEFAULT 0');
CALL AddColumnIfNotExists('chat_messages', 'read_at', 'DATETIME DEFAULT NULL');

-- =========================================================
-- 2. LANCERS CLIENTS - Add institution_type for School vs University
-- =========================================================
CALL AddColumnIfNotExists('lancers_clients', 'institution_type', "ENUM('school','university') NOT NULL DEFAULT 'university'");

-- =========================================================
-- 3. STUDENTS TABLE - Extra profile columns
-- =========================================================
CALL AddColumnIfNotExists('students', 'current_gpa', 'DECIMAL(3,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('students', 'academic_status', "ENUM('regular','probation','suspended','graduated','good','warning','dismissed') DEFAULT 'regular'");
CALL AddColumnIfNotExists('students', 'father_name', 'VARCHAR(100) DEFAULT NULL');
CALL AddColumnIfNotExists('students', 'cnic', 'VARCHAR(20) DEFAULT NULL');
CALL AddColumnIfNotExists('students', 'bform_number', 'VARCHAR(20) DEFAULT NULL');

-- =========================================================
-- 4. COURSES TABLE
-- =========================================================
CALL AddColumnIfNotExists('courses', 'course_type', "ENUM('theory','lab','theory+lab','seminar','internship') DEFAULT 'theory'");
CALL AddColumnIfNotExists('courses', 'credit_hours', 'INT(11) DEFAULT 3');

-- =========================================================
-- 5. SEMESTERS TABLE
-- =========================================================
CALL AddColumnIfNotExists('semesters', 'term_type', "ENUM('Fall','Spring','Summer') DEFAULT 'Fall'");
CALL AddColumnIfNotExists('semesters', 'is_summer', 'TINYINT(1) DEFAULT 0');

-- =========================================================
-- 6. PROGRAMS TABLE
-- =========================================================
CALL AddColumnIfNotExists('programs', 'level', "VARCHAR(50) DEFAULT 'Undergraduate'");

-- =========================================================
-- 7. ATTENDANCE TABLE
-- =========================================================
CALL AddColumnIfNotExists('attendance', 'method', "VARCHAR(50) DEFAULT 'Manual'");

-- =========================================================
-- 8. FINANCE CHALLANS TABLE
-- =========================================================
CALL AddColumnIfNotExists('finance_student_challans', 'reminder_count', 'INT DEFAULT 0');
CALL AddColumnIfNotExists('finance_student_challans', 'last_reminder_at', 'DATETIME NULL');

-- =========================================================
-- 9. COURSE FINAL GRADES - New marking columns
-- =========================================================
CALL AddColumnIfNotExists('course_final_grades', 'midterm_marks', 'DECIMAL(5,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('course_final_grades', 'final_marks', 'DECIMAL(5,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('course_final_grades', 'assignment_marks', 'DECIMAL(5,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('course_final_grades', 'quiz_marks', 'DECIMAL(5,2) DEFAULT 0.00');
CALL AddColumnIfNotExists('course_final_grades', 'lab_marks', 'DECIMAL(5,2) DEFAULT 0.00');

-- =========================================================
-- 10. NEW TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `program_graduation_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `required_credits` int(11) NOT NULL DEFAULT 130,
  `minimum_cgpa` decimal(3,2) NOT NULL DEFAULT 2.00,
  `campus_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `graduation_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `grade_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grade_letter` varchar(5) NOT NULL,
  `grade_points` decimal(3,2) NOT NULL,
  `min_percentage` decimal(5,2) NOT NULL,
  `max_percentage` decimal(5,2) NOT NULL,
  `is_passing` tinyint(1) DEFAULT 1,
  `campus_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_final_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `semester_id` int(11) NOT NULL,
  `midterm_marks` decimal(5,2) DEFAULT 0.00,
  `final_marks` decimal(5,2) DEFAULT 0.00,
  `assignment_marks` decimal(5,2) DEFAULT 0.00,
  `quiz_marks` decimal(5,2) DEFAULT 0.00,
  `lab_marks` decimal(5,2) DEFAULT 0.00,
  `total_marks` decimal(5,2) DEFAULT 0.00,
  `percentage` decimal(5,2) DEFAULT 0.00,
  `letter_grade` varchar(5) DEFAULT NULL,
  `grade_points` decimal(3,2) DEFAULT 0.00,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade` (`student_id`, `course_id`, `semester_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `student_semester_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `credits_attempted` decimal(5,2) DEFAULT 0.00,
  `credits_earned` decimal(5,2) DEFAULT 0.00,
  `semester_gpa` decimal(4,3) DEFAULT 0.000,
  `cumulative_gpa` decimal(4,3) DEFAULT 0.000,
  `academic_standing` varchar(50) DEFAULT 'good',
  `is_frozen` tinyint(1) DEFAULT 0,
  `freeze_reason` text DEFAULT NULL,
  `min_credit_hours_met` tinyint(1) DEFAULT 0,
  `max_credit_hours_ok` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_semester_record` (`student_id`, `semester_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `it_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `created_by` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `face_descriptors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `descriptor` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_face` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `campus_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `date` date NOT NULL,
  `method` varchar(50) DEFAULT 'face',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- Cleanup
-- =========================================================
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

SELECT 'Migration completed successfully!' AS Status;
