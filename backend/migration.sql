-- =========================================================
-- LancersTech LMS - Complete Database Migration Script
-- Run this ONCE on your live VPS MySQL database
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- =========================================================

-- 1. CHAT MESSAGES TABLE - Add missing columns for edit/delete/read
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited TINYINT(1) DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_at DATETIME DEFAULT NULL;

-- 2. LANCERS CLIENTS TABLE - Add institution_type for School vs University
ALTER TABLE lancers_clients ADD COLUMN IF NOT EXISTS institution_type ENUM('school','university') NOT NULL DEFAULT 'university';

-- 3. STUDENTS TABLE - Add extra profile columns
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_gpa DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_status ENUM('regular','probation','suspended','graduated','good','warning','dismissed') DEFAULT 'regular';
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(100) DEFAULT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS cnic VARCHAR(20) DEFAULT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bform_number VARCHAR(20) DEFAULT NULL;

-- 4. COURSES TABLE - Add course type and credit hours
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type ENUM('theory','lab','theory+lab','seminar','internship') DEFAULT 'theory';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS credit_hours INT(11) DEFAULT 3;

-- 5. SEMESTERS TABLE - Add term type
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS term_type ENUM('Fall','Spring','Summer') DEFAULT 'Fall';
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS is_summer TINYINT(1) DEFAULT 0;

-- 6. PROGRAMS TABLE - Add program level
ALTER TABLE programs ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'Undergraduate';

-- 7. ATTENDANCE TABLE - Add attendance method column
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'Manual';

-- 8. FINANCE CHALLANS TABLE - Add reminder tracking columns
ALTER TABLE finance_student_challans ADD COLUMN IF NOT EXISTS reminder_count INT DEFAULT 0;
ALTER TABLE finance_student_challans ADD COLUMN IF NOT EXISTS last_reminder_at DATETIME NULL;

-- 9. EXAM RESULTS TABLE (NEW)
CREATE TABLE IF NOT EXISTS `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. PROGRAM GRADUATION POLICIES TABLE (NEW)
CREATE TABLE IF NOT EXISTS `program_graduation_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `required_credits` int(11) NOT NULL DEFAULT 130,
  `minimum_cgpa` decimal(3,2) NOT NULL DEFAULT 2.00,
  `campus_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. GRADUATION APPLICATIONS TABLE (NEW)
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

-- 12. GRADE POLICIES TABLE (NEW)
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

-- 13. COURSE FINAL GRADES TABLE (NEW) - Main grading table
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

-- If course_final_grades already existed, add new marking columns safely
ALTER TABLE course_final_grades ADD COLUMN IF NOT EXISTS midterm_marks DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE course_final_grades ADD COLUMN IF NOT EXISTS final_marks DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE course_final_grades ADD COLUMN IF NOT EXISTS assignment_marks DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE course_final_grades ADD COLUMN IF NOT EXISTS quiz_marks DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE course_final_grades ADD COLUMN IF NOT EXISTS lab_marks DECIMAL(5,2) DEFAULT 0.00;

-- 14. STUDENT SEMESTER RECORDS TABLE (NEW) - GPA tracking per semester
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

-- 15. IT TICKETS TABLE (NEW)
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

-- 16. FACE DESCRIPTORS TABLE (NEW) - For biometric attendance
CREATE TABLE IF NOT EXISTS `face_descriptors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `descriptor` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_face` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. CAMPUS ATTENDANCE TABLE (NEW) - For face/biometric attendance
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
-- DONE! All tables and columns are now up to date.
-- =========================================================
SELECT 'Migration completed successfully!' AS Status;
