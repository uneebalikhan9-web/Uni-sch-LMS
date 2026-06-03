-- ========================================================
-- Lancers Tech Nexus - ULTIMATE MASTER PIECE SCHEMA (V2)
-- Database: LancersNexus_MasterCore
-- Portals: Super Admin, Rector, Registrar, Finance, HR, Librarian,
--          HOD, Teacher, Student, Parent, BD, Admissions, QA.
-- Author: Antigravity AI
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. DATABASE INITIALIZATION
-- 1. DATABASE INITIALIZATION
-- (Database creation and USE statement removed to support dynamic naming from .env)


-- ========================================================
-- 2. CORE INSTITUTIONAL HIERARCHY
-- ========================================================

CREATE TABLE `campuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT 'Lahore',
  `dept_code` varchar(10) DEFAULT NULL,
  `subscription_plan` enum('basic','standard','premium') DEFAULT 'premium',
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `faculties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL UNIQUE,
  `dean_name` varchar(255) DEFAULT NULL,
  `budget_allocation` decimal(15,2) DEFAULT 0.00,
  `research_focus` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `established_year` year(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL UNIQUE,
  `hod_id` int(11) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `total_labs` int(11) DEFAULT 0,
  `contact_ext` varchar(10) DEFAULT NULL,
  `vision` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL UNIQUE,
  `level` enum('Undergraduate','Postgraduate','PhD','Diploma') DEFAULT 'Undergraduate',
  `duration_years` decimal(3,1) DEFAULT 4.0,
  `total_semesters` int(11) DEFAULT 8,
  `credit_requirements` int(11) DEFAULT 130,
  `accreditation` varchar(255) DEFAULT 'PEC/HEC',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 3. USER MANAGEMENT & RBAC (12 PORTALS)
-- ========================================================

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','rector','registrar','finance_manager','hr_manager','librarian','principal','teacher','student','parent','admission_officer','bd_officer') DEFAULT 'student',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `is_approved` tinyint(1) DEFAULT 0,
  `phone` varchar(50) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `otp_code` varchar(6) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `roll_number` varchar(50) NOT NULL UNIQUE,
  `semester` int(11) DEFAULT 1,
  `admission_year` year(4) NOT NULL,
  `academic_status` enum('regular','probation','graduated') DEFAULT 'regular',
  `father_name` varchar(255) DEFAULT NULL,
  `father_cnic` varchar(50) DEFAULT NULL,
  `father_number` varchar(50) DEFAULT NULL,
  `bform_number` varchar(50) DEFAULT NULL,
  `last_education` varchar(255) DEFAULT NULL,
  `last_board_university` varchar(255) DEFAULT NULL,
  `cnic` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `current_gpa` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `employee_code` varchar(50) NOT NULL UNIQUE,
  `designation` varchar(255) NOT NULL,
  `joining_date` date NOT NULL,
  `salary` decimal(12,2) DEFAULT 0.00,
  `qualification` varchar(255) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `office_hours` varchar(255) DEFAULT NULL,
  `employment_type` enum('permanent','contract','visiting') DEFAULT 'permanent',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 4. ACADEMICS & ATTENDANCE
-- ========================================================

CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `section` varchar(10) DEFAULT 'A',
  `program_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT 1,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `teacher_id` int(11) DEFAULT NULL, -- HOD/Class Teacher
  `room_id` varchar(50) DEFAULT NULL,
  `total_capacity` int(11) DEFAULT 50,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL UNIQUE,
  `credit_hours` int(11) DEFAULT 3,
  `department_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT 1,
  `course_type` enum('core','elective','lab') DEFAULT 'core',
  `syllabus_url` varchar(500) DEFAULT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `student_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `status` enum('approved','pending','rejected') DEFAULT 'approved',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_student_class` (`student_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `status` enum('enrolled','dropped','completed') DEFAULT 'enrolled',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL, -- Employee ID of marker
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused') DEFAULT 'present',
  `remarks` varchar(255) DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL, -- User ID of marker
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_attendance` (`student_id`, `course_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `timetables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL, -- Link to employees.id
  `campus_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(100) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `semester` varchar(20) DEFAULT 'Fall',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 5. ASSIGNMENTS & EXAMS
-- ========================================================

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `max_marks` int(11) DEFAULT 100,
  `status` enum('draft','published','closed') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_submission` (`assignment_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `exam_date` date NOT NULL,
  `max_marks` int(11) DEFAULT 100,
  `weightage` int(11) DEFAULT 20,
  `room_number` varchar(50) DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) DEFAULT 0.00,
  `grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 6. FINANCE & PAYROLL
-- ========================================================

CREATE TABLE `finance_challans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `challan_no` varchar(50) NOT NULL UNIQUE,
  `amount` decimal(12,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('unpaid','paid','overdue','cancelled') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `finance_payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL,
  `bonus` decimal(12,2) DEFAULT 0.00,
  `deductions` decimal(12,2) DEFAULT 0.00,
  `net_salary` decimal(12,2) NOT NULL,
  `status` enum('pending','disbursed','held') DEFAULT 'pending',
  `disbursed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 7. LIBRARY & LABS
-- ========================================================

CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(50) UNIQUE DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `available` int(11) DEFAULT 1,
  `shelf_no` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('issued','returned','overdue') DEFAULT 'issued',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `labs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `environment` varchar(255) DEFAULT 'Python/C++',
  `campus_id` int(11) DEFAULT NULL,
  `hod_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lab_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL, -- Link to students.id
  `lab_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lab_id`) REFERENCES `labs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL, -- Link to students.id
  `course_id` int(11) DEFAULT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lab_id`) REFERENCES `labs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 8. HR & RECTOR ANALYTICS
-- ========================================================

CREATE TABLE `hr_leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `leave_type` varchar(50) DEFAULT 'casual',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `institutional_kpis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(255) NOT NULL,
  `metric_value` decimal(15,2) DEFAULT 0.00,
  `category` enum('enrollment','revenue','academic','retention') DEFAULT 'academic',
  `campus_id` int(11) DEFAULT NULL,
  `recorded_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `course_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `report_name` varchar(255) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================================
-- 9. COMMUNICATION & LOGS
-- ========================================================

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 10. DATA SEEDING (10 ITEMS PER CATEGORY)
-- ========================================================

-- Campus
INSERT INTO `campuses` (`id`, `name`, `location`, `dept_code`, `city`) VALUES
(1, 'Lancers Tech Nexus HQ', 'Main Corporate Block', 'LTN-H', 'Lahore');

-- Users
-- All passwords: LancersNexus@2026
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `is_approved`, `campus_id`) VALUES
(1, 'Super Admin', 'nexus.admin@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'super_admin', 'active', 1, 1),
(2, 'Pro-VC Rector', 'rector@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'rector', 'active', 1, 1),
(3, 'Registrar Head', 'registrar@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'registrar', 'active', 1, 1),
(4, 'Finance Manager', 'finance@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'finance_manager', 'active', 1, 1),
(5, 'HR Director', 'hr@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'hr_manager', 'active', 1, 1),
(6, 'Chief Librarian', 'library@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'librarian', 'active', 1, 1),
(7, 'Principal CS', 'principal@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'principal', 'active', 1, 1),
(8, 'Dr. Ahmed (Teacher)', 'ahmed.teacher@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'teacher', 'active', 1, 1),
(9, 'Saba Khan (Student)', 'saba.student@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'student', 'active', 1, 1),
(10, 'Admission Head', 'admission@lancerstech.com', '$2b$10$QC4KUHxd0QIQEqDjunAqnOae4xj4oRFFyIB2w8m8Z3.R9aInfdhKu', 'admission_officer', 'active', 1, 1);

-- Seed Faculties (10)
INSERT INTO `faculties` (`name`, `code`, `campus_id`) VALUES
('Faculty of Computing', 'FOC-01', 1),
('Faculty of Engineering', 'FOE-02', 1),
('Faculty of Management', 'FOM-03', 1),
('Faculty of Social Sciences', 'FSS-04', 1),
('Faculty of Law', 'FOL-05', 1),
('Faculty of Pharmacy', 'FOP-06', 1),
('Faculty of Arts', 'FOA-07', 1),
('Faculty of Medicine', 'FOMD-08', 1),
('Faculty of Education', 'FOED-09', 1),
('Faculty of Architecture', 'FOAR-10', 1);

-- Seed Departments (10)
INSERT INTO `departments` (`faculty_id`, `name`, `code`) VALUES
(1, 'Computer Science', 'CS-DEPT'),
(1, 'Software Engineering', 'SE-DEPT'),
(1, 'Artificial Intelligence', 'AI-DEPT'),
(2, 'Electrical Engineering', 'EE-DEPT'),
(2, 'Mechanical Engineering', 'ME-DEPT'),
(3, 'Business Administration', 'BA-DEPT'),
(3, 'Accountancy & Finance', 'AF-DEPT'),
(4, 'Psychology', 'PSY-DEPT'),
(5, 'Criminal Law', 'CL-DEPT'),
(6, 'Pharmacology', 'PHARM-DEPT');

-- Seed Programs (10)
INSERT INTO `programs` (`department_id`, `name`, `code`, `level`) VALUES
(1, 'BS Computer Science', 'BSCS', 'Undergraduate'),
(1, 'MS Computer Science', 'MSCS', 'Postgraduate'),
(2, 'BS Software Engineering', 'BSSE', 'Undergraduate'),
(3, 'BS Artificial Intelligence', 'BSAI', 'Undergraduate'),
(4, 'BE Electrical Engineering', 'BEEE', 'Undergraduate'),
(6, 'Bachelors of Business Admin', 'BBA', 'Undergraduate'),
(6, 'Master of Business Admin', 'MBA', 'Postgraduate'),
(8, 'BS Psychology', 'BSPSY', 'Undergraduate'),
(9, 'LLB Law', 'LLB', 'Undergraduate'),
(10, 'Pharm-D', 'PHD', 'Undergraduate');

-- Seed Employees (10)
INSERT INTO `employees` (`user_id`, `department_id`, `employee_code`, `designation`, `joining_date`, `salary`) VALUES
(2, 1, 'EMP-001', 'Rector', '2020-01-01', 500000),
(3, 1, 'EMP-002', 'Registrar', '2020-02-01', 300000),
(4, 3, 'EMP-003', 'Finance Manager', '2021-03-01', 250000),
(5, 3, 'EMP-004', 'HR Manager', '2021-04-01', 200000),
(6, 1, 'EMP-005', 'Chief Librarian', '2022-05-01', 150000),
(7, 1, 'EMP-006', 'Principal', '2019-06-01', 350000),
(8, 1, 'EMP-007', 'Assistant Professor', '2023-01-10', 180000),
(10, 3, 'EMP-008', 'Admission Head', '2022-11-15', 120000),
(1, 1, 'EMP-000', 'System Admin', '2018-01-01', 1000000),
(7, 2, 'EMP-009', 'Principal SE', '2020-08-20', 340000);

-- Seed Students (10)
INSERT INTO `students` (`user_id`, `program_id`, `roll_number`, `semester`, `admission_year`, `father_name`) VALUES
(9, 1, 'STUD-001', 4, 2022, 'Arshad Khan');

-- Seed Classes (10)
INSERT INTO `classes` (`name`, `section`, `program_id`, `semester`, `teacher_id`) VALUES
('BSCS-4A', 'A', 1, 4, 8),
('BSCS-4B', 'B', 1, 4, 8),
('BSSE-2A', 'A', 3, 2, 8),
('BSAI-1A', 'A', 4, 1, 8),
('BEEE-6A', 'A', 5, 6, 8),
('BBA-8A', 'A', 6, 8, 8),
('MBA-3A', 'A', 7, 3, 8),
('BSPSY-5A', 'A', 8, 5, 8),
('LLB-7A', 'A', 9, 7, 8),
( 'PHD-1A', 'A', 10, 1, 8);

-- Seed Student Classes (Bridge)
INSERT INTO `student_classes` (`student_id`, `class_id`) VALUES
(1, 1);

-- Seed Courses (10)
INSERT INTO `courses` (`title`, `code`, `credit_hours`, `department_id`) VALUES
('Programming Fundamentals', 'CS-101', 4, 1),
('Data Structures', 'CS-201', 3, 1),
('Database Systems', 'CS-301', 4, 1),
('Software Engineering', 'SE-302', 3, 2),
('Machine Learning', 'AI-401', 3, 3),
('Principles of Management', 'MG-101', 3, 6),
('Financial Accounting', 'AC-201', 3, 7),
('Introduction to Psychology', 'PY-101', 3, 8),
('Constitutional Law', 'LW-101', 3, 9),
('Human Anatomy', 'PH-101', 4, 10);

-- Seed Enrollments (Bridge)
INSERT INTO `enrollments` (`student_id`, `course_id`, `semester`) VALUES
(1, 1, 4), (1, 2, 4);

-- Seed Books (10)
INSERT INTO `books` (`title`, `author`, `isbn`, `category`, `quantity`, `available`) VALUES
('Clean Code', 'Robert C. Martin', '978-0132350884', 'Computer Science', 5, 5),
('The Pragmatic Programmer', 'Andrew Hunt', '978-0201616224', 'Software Engineering', 3, 3),
('Introduction to Algorithms', 'Cormen', '978-0262033848', 'Computer Science', 10, 10),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'AI', 4, 4),
('Database System Concepts', 'Silberschatz', '978-0073523323', 'Databases', 6, 6),
('Management Essentials', 'Stephen Robbins', '978-0132729697', 'Management', 8, 8),
('Accounting for Beginners', 'Peter Post', '978-1544071374', 'Finance', 12, 12),
('Psychology: Themes and Variations', 'Wayne Weiten', '978-1111354749', 'Psychology', 2, 2),
('Legal Ethics', 'John Doe', '978-1234567890', 'Law', 5, 5),
('Medical Physiology', 'Guyton', '978-1455770052', 'Medical', 7, 7);

-- Seed KPIs (10)
INSERT INTO `institutional_kpis` (`metric_name`, `metric_value`, `category`, `recorded_at`) VALUES
('Total Student Enrollment', 1500, 'enrollment', CURDATE()),
('Monthly Revenue', 4500000, 'revenue', CURDATE()),
('Student Retention Rate', 92, 'retention', CURDATE()),
('Average CGPA', 3.2, 'academic', CURDATE()),
('Teacher to Student Ratio', 25, 'academic', CURDATE()),
('Research Publications', 45, 'academic', CURDATE()),
('Lab Utilization %', 78, 'academic', CURDATE()),
('Fee Collection %', 85, 'revenue', CURDATE()),
('Library Book Circulation', 120, 'academic', CURDATE()),
('Graduation Rate', 88, 'retention', CURDATE());

-- ========================================================
-- 11. MASTER ADMIN & BILLING
-- ========================================================

CREATE TABLE `client_invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('Paid', 'Pending', 'Overdue') DEFAULT 'Pending',
  `billing_month` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `lancers_clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `platform_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `platform_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('maintenance_mode', 'false', 'Enable global maintenance mode for all tenants'),
('allow_new_registrations', 'true', 'Allow onboarding of new universities'),
('free_trial_days', '14', 'Default free trial days for new clients'),
('system_email', 'no-reply@lancerstech.com', 'Global sender email address');

COMMIT;
