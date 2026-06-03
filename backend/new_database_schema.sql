-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2026 at 12:51 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lancersnexus_mastercore`
--

-- --------------------------------------------------------

--
-- Table structure for table `admission_applications`
--

CREATE TABLE `admission_applications` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `stage` enum('Lead','Applied','Shortlisted','Interview','Merit List','Admitted') DEFAULT 'Lead',
  `score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admission_applications`
--

INSERT INTO `admission_applications` (`id`, `name`, `email`, `phone`, `program_id`, `stage`, `score`, `created_at`) VALUES
(1, 'Emma Watson', 'emma@example.com', NULL, 1, 'Lead', 85.00, '2026-05-05 14:52:14'),
(2, 'James Wilson', 'james@example.com', NULL, 2, 'Lead', 78.00, '2026-05-05 14:52:14'),
(3, 'Sophia Lee', 'sophia@example.com', NULL, 3, 'Applied', 92.00, '2026-05-05 14:52:14'),
(4, 'Oliver Chen', 'oliver@example.com', NULL, 1, 'Applied', 88.00, '2026-05-05 14:52:14'),
(5, 'Liam Brown', 'liam@example.com', NULL, 1, 'Interview', 91.00, '2026-05-05 14:52:14'),
(6, 'Noah Anderson', 'noah@example.com', NULL, 3, 'Merit List', 96.00, '2026-05-05 14:52:14'),
(7, 'Lucas Jackson', 'lucas@example.com', NULL, 1, 'Admitted', 95.00, '2026-05-05 14:52:14');

-- --------------------------------------------------------

--
-- Table structure for table `admission_documents`
--

CREATE TABLE `admission_documents` (
  `id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admission_documents`
--

INSERT INTO `admission_documents` (`id`, `application_id`, `document_type`, `status`, `notes`, `created_at`) VALUES
(1, 3, 'Intermediate Transcript', 'verified', 'Awaiting transcript verification', '2026-05-19 16:36:26'),
(2, 3, 'Matric Certificate', 'verified', 'Verified with board', '2026-05-19 16:36:26'),
(3, 4, 'High School Diploma', 'pending', 'Requires IBCC equivalence', '2026-05-19 16:36:26'),
(4, 5, 'A-Level Result Card', 'verified', 'Grade sheet matched with Cambridge database', '2026-05-19 16:36:26'),
(5, 6, 'CNIC / Form-B Copy', 'pending', 'Needs physical copy matching', '2026-05-19 16:36:26'),
(6, 7, 'FSc Transcripts', 'verified', 'Final board verification complete', '2026-05-19 16:36:26');

-- --------------------------------------------------------

--
-- Table structure for table `admission_interviews`
--

CREATE TABLE `admission_interviews` (
  `id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `interview_date` date DEFAULT NULL,
  `interview_time` time DEFAULT NULL,
  `interviewer` varchar(255) DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admission_interviews`
--

INSERT INTO `admission_interviews` (`id`, `application_id`, `interview_date`, `interview_time`, `interviewer`, `status`) VALUES
(1, 5, '2025-03-20', '10:00:00', 'Prof. Johnson', 'Scheduled'),
(2, 3, '2025-03-21', '11:30:00', 'Dr. Smith', 'Scheduled');

-- --------------------------------------------------------

--
-- Table structure for table `admission_logs`
--

CREATE TABLE `admission_logs` (
  `id` int(11) NOT NULL,
  `action_text` varchar(255) NOT NULL,
  `action_type` enum('application','interview','verification','merit','other') DEFAULT 'other',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admission_logs`
--

INSERT INTO `admission_logs` (`id`, `action_text`, `action_type`, `created_at`) VALUES
(1, 'Emma Watson submitted initial lead', 'application', '2026-05-05 15:32:15'),
(2, 'Liam Brown interview scheduled with Prof. Johnson', 'interview', '2026-05-05 15:32:15'),
(3, 'Noah Anderson moved to Merit List', 'merit', '2026-05-05 15:32:15'),
(4, 'Lucas Jackson admission confirmed', 'application', '2026-05-05 15:32:15'),
(5, 'Sophia Lee document verification pending', 'verification', '2026-05-05 15:32:15');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `max_marks` int(11) DEFAULT 100,
  `status` enum('published','draft','closed') DEFAULT 'published',
  `assignment_type` varchar(50) DEFAULT 'Homework',
  `academic_period` varchar(50) DEFAULT '2026-2027',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `course_id`, `teacher_id`, `title`, `description`, `file_url`, `file_name`, `due_date`, `max_marks`, `status`, `assignment_type`, `academic_period`, `created_at`) VALUES
(1, 2, 3, 'assigment', 'ok ', NULL, NULL, '2026-05-07 14:21:00', 100, 'published', 'Lab', '2026-2027', '2026-05-07 14:21:20');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused') DEFAULT 'present',
  `marked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `class_id`, `course_id`, `teacher_id`, `student_id`, `date`, `status`, `marked_by`, `created_at`) VALUES
(2, 1, 2, 3, 104, '2026-05-13', 'absent', NULL, '2026-05-13 09:10:49'),
(3, 1, 2, 3, 104, '2026-05-12', 'late', NULL, '2026-05-13 09:11:21'),
(4, 1, 2, 3, 104, '2026-05-11', 'present', NULL, '2026-05-13 09:11:27'),
(5, 2, 3, 3, 104, '2026-05-13', 'absent', NULL, '2026-05-13 09:14:52'),
(6, 2, 3, 3, 104, '2026-05-11', 'present', NULL, '2026-05-13 09:14:58'),
(7, 2, 3, 3, 104, '2026-05-12', 'late', NULL, '2026-05-13 09:15:05'),
(8, 2, 3, 3, 104, '2026-05-10', 'present', NULL, '2026-05-13 09:15:14'),
(11, 2, 3, 3, 104, '2026-05-20', 'absent', NULL, '2026-05-20 18:09:51');

-- --------------------------------------------------------

--
-- Table structure for table `bd_applicants`
--

CREATE TABLE `bd_applicants` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `subjects` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('applied','shortlisted','interviewed','hired','rejected') DEFAULT 'applied',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bd_bulk_hires`
--

CREATE TABLE `bd_bulk_hires` (
  `id` int(11) NOT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `batch_name` varchar(255) NOT NULL,
  `teacher_count` int(11) NOT NULL,
  `subject_areas` varchar(255) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `status` enum('planning','recruiting','onboarding','completed','cancelled') DEFAULT 'planning',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bd_bulk_hires`
--

INSERT INTO `bd_bulk_hires` (`id`, `campus_id`, `batch_name`, `teacher_count`, `subject_areas`, `target_date`, `status`, `notes`, `created_at`) VALUES
(1, 1, 'A', 16, 'MAth', '2026-05-18', 'planning', NULL, '2026-05-18 15:00:57');

-- --------------------------------------------------------

--
-- Table structure for table `bd_campus_leads`
--

CREATE TABLE `bd_campus_leads` (
  `id` int(11) NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `deal_value` decimal(12,2) DEFAULT 0.00,
  `status` enum('prospect','contacted','proposal','negotiation','closed_won','closed_lost') DEFAULT 'prospect',
  `notes` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bd_campus_leads`
--

INSERT INTO `bd_campus_leads` (`id`, `institution_name`, `contact_person`, `contact_email`, `contact_phone`, `city`, `deal_value`, `status`, `notes`, `assigned_to`, `created_at`, `updated_at`) VALUES
(1, 'Lancers tech', 'Ali khan', 'alikhan@gmail.com', NULL, 'lahore', -5.00, 'proposal', NULL, 111, '2026-05-18 14:55:22', '2026-05-18 14:55:22');

-- --------------------------------------------------------

--
-- Table structure for table `bd_job_postings`
--

CREATE TABLE `bd_job_postings` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `slots_available` int(11) DEFAULT 1,
  `slots_filled` int(11) DEFAULT 0,
  `experience_required` varchar(100) DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `invite_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bd_job_postings`
--

INSERT INTO `bd_job_postings` (`id`, `title`, `subject`, `campus_id`, `slots_available`, `slots_filled`, `experience_required`, `salary_range`, `description`, `deadline`, `status`, `invite_token`, `created_at`) VALUES
(1, 'Teacher Job', 'Lahore', 1, 20, 0, NULL, NULL, NULL, NULL, 'open', 'a5058c246840250c641aa247da96ae8fe13a90c48ee0d4c5', '2026-05-18 14:56:28');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `isbn` varchar(100) NOT NULL,
  `author` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 1,
  `available` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `isbn`, `author`, `category`, `stock`, `available`) VALUES
(1, 'Introduction to Algorithms', '978-0262033848', 'Thomas H. Cormen', 'CS / Engineering', 10, 8),
(2, 'Computer Networks', '978-0132126953', 'Andrew S. Tanenbaum', 'CS / Engineering', 6, 5),
(3, 'Database System Concepts', '978-0073523323', 'Abraham Silberschatz', 'CS / Engineering', 8, 7),
(4, 'Artificial Intelligence: A Modern Approach', '978-0136086208', 'Stuart Russell', 'CS / Engineering', 5, 2),
(5, 'Operating System Concepts', '978-1118063330', 'Abraham Silberschatz', 'CS / Engineering', 7, 7),
(6, 'Business Psychology and Organisational Behaviour', '978-1848721593', 'Eugene McKenna', 'Management', 12, 10),
(7, 'Principles of Marketing', '978-0134492513', 'Philip Kotler', 'Management', 9, 8),
(8, 'Advanced Engineering Mathematics', '978-0470458365', 'Erwin Kreyszig', 'Mathematics', 15, 14);

-- --------------------------------------------------------

--
-- Table structure for table `book_issues`
--

CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` enum('issued','returned','overdue') DEFAULT 'issued'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_issues`
--

INSERT INTO `book_issues` (`id`, `book_id`, `user_id`, `issue_date`, `return_date`, `due_date`, `status`) VALUES
(1, 1, 101, '2026-05-17', NULL, '2026-05-27', 'issued'),
(2, 2, 102, '2026-05-05', NULL, '2026-05-15', 'overdue'),
(3, 3, 109, '2026-05-10', '2026-05-17', '2026-05-18', 'returned');

-- --------------------------------------------------------

--
-- Table structure for table `campuses`
--

CREATE TABLE `campuses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `dept_code` varchar(10) DEFAULT NULL,
  `subscription_plan` enum('basic','standard','premium') DEFAULT 'basic',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campuses`
--

INSERT INTO `campuses` (`id`, `name`, `location`, `dept_code`, `subscription_plan`, `is_active`, `created_at`, `updated_at`, `client_id`) VALUES
(1, 'Lancers Tech Main Campus', 'Corporate HQ', 'LTM', 'premium', 1, '2026-05-01 21:06:39', '2026-05-21 20:59:57', 4),
(9, 'Gulberg', 'Gulberg', NULL, 'basic', 1, '2026-05-16 14:12:34', '2026-05-21 20:59:57', 4),
(10, 'DHA', 'DHA', NULL, 'basic', 1, '2026-05-16 14:12:48', '2026-05-21 20:59:57', 4),
(11, 'Bahria Town', 'Bahria Town', NULL, 'basic', 1, '2026-05-16 14:13:00', '2026-05-21 20:59:57', 4),
(12, 'Johar Town', 'Johar Town', NULL, 'basic', 1, '2026-05-16 14:13:10', '2026-05-21 20:59:57', 4),
(15, 'Asia university', 'MM road', NULL, 'basic', 1, '2026-05-22 20:39:57', '2026-05-22 20:39:57', 7);

-- --------------------------------------------------------

--
-- Table structure for table `challans`
--

CREATE TABLE `challans` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('unpaid','paid') DEFAULT 'unpaid',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `read_at`) VALUES
(1, 2, 3, 'HI Sir', '2026-05-06 12:39:16', NULL),
(2, 6, 2, 'HI Sir', '2026-05-15 11:18:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `section` varchar(50) DEFAULT 'A',
  `academic_year` varchar(20) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `section`, `academic_year`, `teacher_id`, `program_id`, `campus_id`, `created_at`) VALUES
(1, 'b11', 'a', '2024-2025', 3, NULL, 1, '2026-05-07 13:36:11'),
(2, 'bs it ', 'B', '2024-2025', 3, NULL, 1, '2026-05-08 13:31:45'),
(3, 'React', 'A', '2024-2025', 3, NULL, 1, '2026-05-20 18:15:40'),
(4, 'text class', 'A', '2024-2025', 3, NULL, 1, '2026-05-20 18:19:56'),
(5, 'React ', 'B', '2024-2025', 7, NULL, 15, '2026-05-23 12:23:43');

-- --------------------------------------------------------

--
-- Table structure for table `class_courses`
--

CREATE TABLE `class_courses` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_invoices`
--

CREATE TABLE `client_invoices` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Paid','Pending','Overdue') DEFAULT 'Pending',
  `billing_month` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_invoices`
--

INSERT INTO `client_invoices` (`id`, `client_id`, `amount`, `status`, `billing_month`, `created_at`, `updated_at`) VALUES
(1, 4, 5000.00, 'Paid', '2026-07', '2026-05-21 22:20:17', '2026-05-21 22:20:23');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `credit_hours` int(11) DEFAULT 3,
  `status` enum('active','completed','archived') DEFAULT 'active',
  `created_by_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `program_id`, `class_id`, `teacher_id`, `campus_id`, `title`, `code`, `description`, `credit_hours`, `status`, `created_by_admin`, `created_at`) VALUES
(2, NULL, 1, 3, 1, 'business  managment ', NULL, 'intro to business ', 3, 'completed', 1, '2026-05-07 13:42:11'),
(3, NULL, 2, 3, 1, 'math', NULL, 'math', 3, 'active', 1, '2026-05-08 13:32:04'),
(4, NULL, 2, 3, 1, 'math', NULL, 'math', 3, 'active', 1, '2026-05-20 17:57:54'),
(5, NULL, 3, 3, 1, 'node', NULL, 'node', 3, 'active', 1, '2026-05-20 18:16:18'),
(6, NULL, 5, 7, 15, 'mangodb', NULL, 'Mangodb', 3, 'active', 1, '2026-05-23 12:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `course_reports`
--

CREATE TABLE `course_reports` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `course_title` varchar(255) NOT NULL DEFAULT '',
  `class_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `campus_id` int(11) DEFAULT NULL,
  `campus_name` varchar(255) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `total_students` int(11) DEFAULT 0,
  `avg_attendance` decimal(5,2) DEFAULT 0.00,
  `avg_marks` decimal(5,2) DEFAULT 0.00,
  `pass_count` int(11) DEFAULT 0,
  `fail_count` int(11) DEFAULT 0,
  `total_assignments` int(11) DEFAULT 0,
  `completed_at` datetime DEFAULT current_timestamp(),
  `generated_by` varchar(255) DEFAULT NULL,
  `generated_by_role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_reports`
--

INSERT INTO `course_reports` (`id`, `course_id`, `course_title`, `class_name`, `campus_id`, `campus_name`, `teacher_id`, `teacher_name`, `total_students`, `avg_attendance`, `avg_marks`, `pass_count`, `fail_count`, `total_assignments`, `completed_at`, `generated_by`, `generated_by_role`) VALUES
(1, 2, 'business  managment ', 'b11', 1, 'Lancers Tech Main Campus', 3, 'Finance Manager', 1, 33.33, 100.00, 2, 0, 1, '2026-05-18 19:04:11', 'principal', 'principal');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `faculty_id`, `campus_id`, `name`, `code`, `created_at`, `client_id`) VALUES
(4, NULL, 1, 'Computer Science', 'CS01', '2026-05-13 09:46:57', 4),
(5, NULL, 1, 'Business Administration', 'BA01', '2026-05-13 09:46:57', 4),
(6, NULL, 1, 'Electrical Engineering', 'EE01', '2026-05-13 09:46:57', 4);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `employee_code` varchar(50) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `specialization` text DEFAULT NULL,
  `joining_date` date NOT NULL,
  `employment_type` enum('permanent','adjunct','visiting','contract') DEFAULT 'permanent',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `department_id`, `employee_code`, `designation`, `specialization`, `joining_date`, `employment_type`, `created_at`) VALUES
(1, 2, NULL, 'HOD-001', 'Head of Department', NULL, '2026-05-01', 'permanent', '2026-05-01 21:06:39'),
(2, 3, NULL, 'FIN-001', 'Chief Accounts Officer', NULL, '2026-05-01', 'permanent', '2026-05-01 21:06:39'),
(3, 108, NULL, 'EMP-52455', 'Lecturer', NULL, '2026-05-06', 'permanent', '2026-05-06 12:57:32'),
(4, 169, NULL, 'EMP-35056', 'Lecturer', NULL, '2026-05-18', 'permanent', '2026-05-18 12:05:35'),
(5, 171, NULL, 'EMP-63780', 'Lecturer', NULL, '2026-05-18', 'permanent', '2026-05-18 12:06:03'),
(7, 184, NULL, 'EMP-53409', 'Lecturer', NULL, '2026-05-23', 'permanent', '2026-05-22 21:05:53');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `status` enum('pending','approved','dropped','completed') DEFAULT 'pending',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `semester`, `academic_year`, `status`, `enrolled_at`) VALUES
(3, 101, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(4, 101, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(5, 102, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(6, 102, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(7, 104, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(8, 104, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(9, 105, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(10, 105, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(11, 106, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(12, 106, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(13, 107, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(14, 107, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(15, 108, 2, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(16, 108, 3, 1, '2026', 'approved', '2026-05-19 20:15:12'),
(17, 104, 4, 0, '', 'approved', '2026-05-20 18:16:41'),
(18, 104, 5, 0, '', 'approved', '2026-05-20 18:16:43'),
(19, 110, 3, 0, '', 'pending', '2026-05-20 18:28:27'),
(20, 110, 4, 0, '', 'pending', '2026-05-20 18:28:28'),
(23, 111, 6, 0, '', 'approved', '2026-05-23 13:11:03');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `exam_date` date NOT NULL,
  `max_marks` int(11) NOT NULL DEFAULT 100,
  `room_number` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `course_id`, `name`, `exam_date`, `max_marks`, `room_number`) VALUES
(1, 2, 'Midterm Examination', '2026-05-10', 100, 'Room 302'),
(2, 3, 'Final Examination', '2026-05-15', 100, 'Main Hall A'),
(3, 3, 'Math', '2026-05-22', 100, 'Section A');

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`id`, `exam_id`, `student_id`, `marks_obtained`, `grade`, `gpa`, `remarks`) VALUES
(1, 1, 101, 82.00, 'B', 3.28, 'Satisfactory'),
(2, 1, 102, 89.00, 'A', 3.56, 'Needs improvement'),
(3, 1, 104, 58.00, 'C', 2.32, 'Good effort'),
(4, 1, 105, 65.00, 'C', 2.60, 'Outstanding performance'),
(5, 1, 106, 72.00, 'B', 2.88, 'Satisfactory'),
(6, 1, 107, 79.00, 'B', 3.16, 'Needs improvement'),
(7, 1, 108, 86.00, 'A', 3.44, 'Excellent grasp of concepts'),
(8, 2, 101, 82.00, 'B', 3.28, 'Satisfactory'),
(9, 2, 102, 89.00, 'A', 3.56, 'Needs improvement'),
(10, 2, 104, 58.00, 'C', 2.32, 'Good effort'),
(11, 2, 105, 65.00, 'C', 2.60, 'Outstanding performance'),
(12, 2, 106, 72.00, 'B', 2.88, 'Satisfactory'),
(13, 2, 107, 79.00, 'B', 3.16, 'Needs improvement'),
(14, 2, 108, 86.00, 'A', 3.44, 'Excellent grasp of concepts');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `student_id`, `course_id`, `lab_id`, `rating`, `comment`, `submitted_at`) VALUES
(1, 104, NULL, 1, 4, 'Good', '2026-05-07 14:50:18'),
(2, 104, NULL, 1, 4, 'good', '2026-05-08 13:33:28');

-- --------------------------------------------------------

--
-- Table structure for table `fee_invoices`
--

CREATE TABLE `fee_invoices` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `due_date` date NOT NULL,
  `status` enum('unpaid','partially_paid','paid','cancelled') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_payments`
--

CREATE TABLE `fee_payments` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(100) DEFAULT 'bank',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_structures`
--

CREATE TABLE `fee_structures` (
  `id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `tuition_fee` decimal(12,2) NOT NULL,
  `lab_fee` decimal(12,2) DEFAULT 0.00,
  `library_fee` decimal(12,2) DEFAULT 0.00,
  `other_fee` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finance_challans`
--

CREATE TABLE `finance_challans` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `challan_no` varchar(50) NOT NULL,
  `tuition_fee` decimal(10,2) DEFAULT 0.00,
  `lab_fee` decimal(10,2) DEFAULT 0.00,
  `library_fee` decimal(10,2) DEFAULT 0.00,
  `other_fee` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('pending','paid','overdue','waived') NOT NULL DEFAULT 'pending',
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reminder_count` int(11) DEFAULT 0,
  `last_reminder_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_challans`
--

INSERT INTO `finance_challans` (`id`, `student_id`, `challan_no`, `tuition_fee`, `lab_fee`, `library_fee`, `other_fee`, `total_amount`, `due_date`, `paid_date`, `status`, `semester`, `academic_year`, `notes`, `campus_id`, `created_at`, `reminder_count`, `last_reminder_at`) VALUES
(3, 106, 'LT-FEE-20260501-03', 55000.00, 6000.00, 3000.00, 1000.00, 65000.00, '2026-06-15', NULL, 'pending', 'Spring 2026', '2026', 'Pending fee submission', 1, '2026-05-19 13:46:39', 0, NULL),
(5, 104, 'LT-FEE-1779199994606', 500.00, 500.00, 500.00, 0.00, 1500.00, '2026-05-28', '2026-05-19', 'paid', '', '2024-25', NULL, 1, '2026-05-19 14:13:14', 1, '2026-05-19 19:15:32');

-- --------------------------------------------------------

--
-- Table structure for table `finance_expenses`
--

CREATE TABLE `finance_expenses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('utilities','maintenance','supplies','events','salaries','other') DEFAULT 'other',
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_expenses`
--

INSERT INTO `finance_expenses` (`id`, `title`, `category`, `amount`, `expense_date`, `description`, `campus_id`, `added_by`, `created_at`) VALUES
(3, 'High-Speed Fiber Internet', 'utilities', 12000.00, '2026-05-12', 'Campus main line internet subscription', 1, 3, '2026-05-19 13:46:39'),
(4, 'Science Lab Glassware & Supplies', 'maintenance', 24500.00, '2026-05-14', 'Chemical reagents and lab upgrade glassware', 1, 3, '2026-05-19 13:46:39');

-- --------------------------------------------------------

--
-- Table structure for table `finance_payroll`
--

CREATE TABLE `finance_payroll` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(4) NOT NULL,
  `basic_salary` decimal(10,2) DEFAULT 0.00,
  `bonus` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `net_payable` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','disbursed','held') NOT NULL DEFAULT 'pending',
  `disbursed_at` timestamp NULL DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_payroll`
--

INSERT INTO `finance_payroll` (`id`, `employee_id`, `month`, `year`, `basic_salary`, `bonus`, `deductions`, `net_payable`, `status`, `disbursed_at`, `campus_id`, `created_at`) VALUES
(2, 1, 'May', 2026, 120000.00, 10000.00, 5000.00, 125000.00, 'disbursed', '2026-05-01 05:00:00', 1, '2026-05-19 13:46:39'),
(3, 3, 'May', 2026, 80000.00, 5000.00, 3000.00, 82000.00, 'disbursed', '2026-05-01 06:30:00', 1, '2026-05-19 13:46:39'),
(4, 4, 'May', 2026, 75000.00, 0.00, 2000.00, 73000.00, 'disbursed', '2026-05-19 14:09:19', 1, '2026-05-19 13:46:39');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `exam_type` varchar(100) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL,
  `max_marks` int(11) DEFAULT 100,
  `grade_letter` varchar(5) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `student_id`, `course_id`, `teacher_id`, `exam_type`, `marks_obtained`, `max_marks`, `grade_letter`, `percentage`, `exam_date`, `remarks`, `created_at`) VALUES
(1, 104, 2, 3, 'quiz', 100.00, 100, 'A+', 100.00, '2026-05-07', '80', '2026-05-07 14:38:26'),
(2, 104, 2, 3, 'assignment', 100.00, 100, 'A+', 100.00, '2026-05-08', '40', '2026-05-08 13:23:01'),
(3, 111, 6, 7, 'midterm', 100.00, 100, 'A+', 100.00, '2026-05-23', '120', '2026-05-23 14:20:38');

-- --------------------------------------------------------

--
-- Table structure for table `hr_job_postings`
--

CREATE TABLE `hr_job_postings` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `status` enum('Active','Closed') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hr_job_postings`
--

INSERT INTO `hr_job_postings` (`id`, `title`, `description`, `department`, `posted_by`, `status`, `created_at`) VALUES
(1, 'Teacher ', NULL, 'Lancer tech', NULL, 'Active', '2026-05-18 15:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `hr_leave_requests`
--

CREATE TABLE `hr_leave_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hr_leave_requests`
--

INSERT INTO `hr_leave_requests` (`id`, `user_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `created_at`) VALUES
(3, 2, 'Sick Leave', '2026-05-20', '2026-05-22', 'Suffering from severe flu and high temperature.', 'Rejected', '2026-05-18 15:48:51'),
(4, 3, 'Casual Leave', '2026-05-25', '2026-05-26', 'Family emergency event at home town.', 'Pending', '2026-05-18 15:48:51'),
(5, 108, 'Sick', '2026-05-18', '2026-05-22', 'sir tabiyat nahi thk ', 'Rejected', '2026-05-18 16:11:01'),
(6, 2, 'Maternity', '2026-05-18', '2026-05-20', 'Hyee allah', 'Approved', '2026-05-18 16:12:30'),
(7, 184, 'Sick', '2026-05-23', '2026-05-27', 'tirad', 'Pending', '2026-05-23 14:21:30');

-- --------------------------------------------------------

--
-- Table structure for table `institutional_kpis`
--

CREATE TABLE `institutional_kpis` (
  `id` int(11) NOT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `metric_name` varchar(255) NOT NULL,
  `metric_value` decimal(15,2) DEFAULT 0.00,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `institutional_kpis`
--

INSERT INTO `institutional_kpis` (`id`, `campus_id`, `metric_name`, `metric_value`, `recorded_at`) VALUES
(1, NULL, 'overall_gpa', 3.42, '2026-05-15 11:06:59'),
(2, NULL, 'retention_rate', 94.50, '2026-05-15 11:06:59'),
(3, NULL, 'research_grants', 1200000.00, '2026-05-15 11:06:59'),
(4, NULL, 'employment_rate', 88.00, '2026-05-15 11:06:59');

-- --------------------------------------------------------

--
-- Table structure for table `it_audit_logs`
--

CREATE TABLE `it_audit_logs` (
  `id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `it_system_config`
--

CREATE TABLE `it_system_config` (
  `id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `it_system_config`
--

INSERT INTO `it_system_config` (`id`, `config_key`, `config_value`, `description`, `updated_at`) VALUES
(1, 'app_name', 'Lancers Tech LMS', 'Main application name', '2026-05-05 16:59:58'),
(2, 'smtp_host', 'smtp.lancerstech.com', 'SMTP Server Host', '2026-05-05 16:59:58'),
(3, 'maintenance_mode', 'false', 'Enable/Disable maintenance mode', '2026-05-05 16:59:58'),
(4, 'max_upload_size', '50MB', 'Maximum file upload size', '2026-05-05 16:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `it_tickets`
--

CREATE TABLE `it_tickets` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `category` varchar(100) DEFAULT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `labs`
--

CREATE TABLE `labs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `hod_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `environment` varchar(255) DEFAULT 'Python'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `labs`
--

INSERT INTO `labs` (`id`, `name`, `description`, `icon`, `url`, `class_id`, `hod_id`, `campus_id`, `environment`) VALUES
(1, 'Lab', 'lab', 'Code', 'https://onecompiler.com/embed/nodejs', 1, 2, 1, 'Node.js');

-- --------------------------------------------------------

--
-- Table structure for table `lab_usage`
--

CREATE TABLE `lab_usage` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `lab_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `submission_code` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lancers_clients`
--

CREATE TABLE `lancers_clients` (
  `id` int(11) NOT NULL,
  `university_name` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `package_type` enum('Basic','Premium','Enterprise') DEFAULT 'Premium',
  `subscription_status` enum('Active','Suspended','Trial') DEFAULT 'Active',
  `monthly_fee` decimal(10,2) DEFAULT 0.00,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logo_url` varchar(255) DEFAULT NULL,
  `primary_color` varchar(50) DEFAULT NULL,
  `allowed_modules` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lancers_clients`
--

INSERT INTO `lancers_clients` (`id`, `university_name`, `domain`, `admin_name`, `admin_email`, `package_type`, `subscription_status`, `monthly_fee`, `registered_at`, `logo_url`, `primary_color`, `allowed_modules`) VALUES
(4, 'Lancers Nexus University', 'nexus.lancerstech.com', 'Lancers Nexus Root', 'nexus.admin@lancerstech.com', 'Enterprise', 'Active', 5000.00, '2026-05-21 13:57:59', NULL, NULL, '[\"rector\",\"principals\",\"bd\",\"hr\",\"finance\",\"registrar\",\"admissions\",\"exams\",\"library\",\"it\"]'),
(7, 'Asia', 'asiauniversity.com', 'Shahrukh farooq', 'shahrukhfarooq@gmail.com', 'Premium', 'Active', 200000.00, '2026-05-22 20:37:29', 'https://nsis.navttc.gov.pk/assets/images/logo/PMYP-LOGO-01.png', '#7f2dfb', '[\"rector\",\"principals\",\"bd\",\"finance\",\"admissions\",\"library\"]'),
(8, 'UET', 'URT,com', 'shaheryar', 'shaheryar@gmail.com', 'Premium', 'Active', 500000.00, '2026-05-25 22:03:30', 'https://pu.edu.pk/temp1/img/logo.png', 'var(--primary-color, #4f46e5)', '[\"rector\",\"principals\",\"hr\",\"finance\",\"library\",\"it\",\"registrar\"]');

-- --------------------------------------------------------

--
-- Table structure for table `library_books`
--

CREATE TABLE `library_books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `rack_location` varchar(50) DEFAULT NULL,
  `status` enum('Available','Issued','Reserved','Maintenance') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_books`
--

INSERT INTO `library_books` (`id`, `title`, `author`, `isbn`, `category`, `rack_location`, `status`, `created_at`) VALUES
(1, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'CS / Engineering', 'Shelf A-4', 'Issued', '2026-05-20 14:18:49'),
(3, 'Database System Concepts', 'Abraham Silberschatz', '978-0073523323', 'CS / Engineering', 'Shelf A-1', 'Available', '2026-05-20 14:18:49'),
(4, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136086208', 'CS / Engineering', 'Shelf C-3', 'Issued', '2026-05-20 14:18:49'),
(5, 'Operating System Concepts', 'Abraham Silberschatz', '978-1118063330', 'CS / Engineering', 'Shelf B-1', 'Available', '2026-05-20 14:18:49'),
(6, 'Business Psychology', 'Eugene McKenna', '978-1848721593', 'Management', 'Shelf D-2', 'Issued', '2026-05-20 14:18:49'),
(7, 'Principles of Marketing', 'Philip Kotler', '978-0134492513', 'Management', 'Shelf D-5', 'Available', '2026-05-20 14:18:49'),
(8, 'Advanced Engineering Mathematics', 'Erwin Kreyszig', '978-0470458365', 'Mathematics', 'Shelf E-1', 'Available', '2026-05-20 14:18:49'),
(9, 'Introduction to Electrodynamics', 'David J. Griffiths', '978-0321856562', 'Physics', 'Shelf F-3', 'Available', '2026-05-20 14:18:49'),
(10, 'University Physics', 'Hugh D. Young', '978-0321973610', 'Physics', 'Shelf F-1', 'Available', '2026-05-20 14:18:49');

-- --------------------------------------------------------

--
-- Table structure for table `library_members`
--

CREATE TABLE `library_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('Active','Suspended','Expired') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_members`
--

INSERT INTO `library_members` (`id`, `name`, `email`, `role`, `department`, `status`, `created_at`) VALUES
(1, 'Emma Richardson', 'emma@student.com', 'student', 'Computer Science', 'Active', '2026-05-20 14:18:49'),
(2, 'James Chen', 'james@student.com', 'student', 'Software Engineering', 'Active', '2026-05-20 14:18:49'),
(3, 'Talha Khan', 'talha@gmail.com', 'student', 'Business Administration', 'Active', '2026-05-20 14:18:49'),
(4, 'Adeel Ahmad', 'adeel12@gmail.com', 'student', 'Electrical Engineering', 'Active', '2026-05-20 14:18:49'),
(5, 'Abid Ali', 'abid@gmail.com', 'student', 'Mathematics', 'Active', '2026-05-20 14:18:49');

-- --------------------------------------------------------

--
-- Table structure for table `library_transactions`
--

CREATE TABLE `library_transactions` (
  `id` int(11) NOT NULL,
  `book_id` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('Issued','Returned','Overdue') DEFAULT 'Issued'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_transactions`
--

INSERT INTO `library_transactions` (`id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`, `fine_amount`, `status`) VALUES
(1, 1, 1, '2026-05-16', '2026-05-26', NULL, 0.00, 'Issued'),
(2, 4, 2, '2026-04-30', '2026-05-14', NULL, 150.00, 'Overdue'),
(3, 3, 3, '2026-05-10', '2026-05-18', '2026-05-17', 0.00, 'Returned'),
(4, 6, 3, NULL, '2026-05-11', NULL, 0.00, 'Issued');

-- --------------------------------------------------------

--
-- Table structure for table `marks`
--

CREATE TABLE `marks` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'maintenance_mode', 'false', 'Enable global maintenance mode for all tenants', '2026-05-30 10:47:33'),
(2, 'allow_new_registrations', 'false', 'Allow onboarding of new universities', '2026-05-30 10:47:33'),
(3, 'free_trial_days', '14', 'Default free trial days for new clients', '2026-05-21 22:24:31'),
(4, 'system_email', 'no-reply@lancerstech.com', 'Global sender email address', '2026-05-21 22:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT 'Undergraduate',
  `duration_years` decimal(3,1) DEFAULT 4.0,
  `accreditation_status` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `department_id`, `name`, `code`, `level`, `duration_years`, `accreditation_status`, `created_at`) VALUES
(1, NULL, 'BS Computer Science', 'BSCS', 'Undergraduate', 4.0, 'HEC Approved', '2026-05-04 12:43:28'),
(2, NULL, 'BBA Marketing', 'BBA-M', 'Undergraduate', 4.0, 'HEC Approved', '2026-05-04 12:43:28'),
(3, NULL, 'BS Software Engineering', 'BSSE', 'Undergraduate', 4.0, NULL, '2026-05-19 15:57:39');

-- --------------------------------------------------------

--
-- Table structure for table `registrar_degrees`
--

CREATE TABLE `registrar_degrees` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `degree_title` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `serial_number` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Verified','Issued') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrar_degrees`
--

INSERT INTO `registrar_degrees` (`id`, `student_id`, `degree_title`, `issue_date`, `serial_number`, `status`) VALUES
(1, 102, 'BBA Marketing', '2025-01-10', 'LTS-D-2024-1289', 'Issued'),
(2, 101, 'BS Computer Science', '2026-01-15', 'LTS-D-2025-0932', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `registrar_degree_verifications`
--

CREATE TABLE `registrar_degree_verifications` (
  `id` int(11) NOT NULL,
  `degree_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `requester_email` varchar(100) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `status` enum('Pending','Verified','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrar_degree_verifications`
--

INSERT INTO `registrar_degree_verifications` (`id`, `degree_id`, `company_name`, `requester_email`, `request_date`, `status`) VALUES
(1, 1, 'Google Inc.', NULL, '2025-03-15', 'Verified'),
(2, 2, 'Goldman Sachs', NULL, '2025-03-14', 'Rejected');

-- --------------------------------------------------------

--
-- Table structure for table `registrar_transcript_requests`
--

CREATE TABLE `registrar_transcript_requests` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `request_date` date DEFAULT NULL,
  `status` enum('Pending','Processing','Completed','Rejected') DEFAULT 'Pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrar_transcript_requests`
--

INSERT INTO `registrar_transcript_requests` (`id`, `student_id`, `request_date`, `status`, `notes`) VALUES
(1, 101, '2025-03-16', 'Pending', NULL),
(2, 102, '2025-03-12', 'Processing', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `research_projects`
--

CREATE TABLE `research_projects` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `lead_pi` varchar(255) DEFAULT NULL,
  `funding` decimal(15,2) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `research_projects`
--

INSERT INTO `research_projects` (`id`, `title`, `lead_pi`, `funding`, `duration`, `impact`) VALUES
(1, 'AI in Education Systems', 'Dr. Salman', 500000.00, '2 Years', 'High'),
(2, 'Quantum Computing Labs', 'Dr. Ahmed', 1200000.00, '3 Years', 'Global'),
(3, 'Sustainable Energy Grids', 'Prof. Raza', 750000.00, '1.5 Years', 'Medium');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `roll_number` varchar(50) NOT NULL,
  `semester` int(11) DEFAULT 1,
  `admission_year` year(4) NOT NULL,
  `academic_status` enum('regular','probation','suspended','graduated') DEFAULT 'regular',
  `cnic` varchar(50) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `father_cnic` varchar(50) DEFAULT NULL,
  `father_number` varchar(50) DEFAULT NULL,
  `bform_number` varchar(50) DEFAULT NULL,
  `last_education` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `program_id`, `roll_number`, `semester`, `admission_year`, `academic_status`, `cnic`, `father_name`, `father_cnic`, `father_number`, `bform_number`, `last_education`, `created_at`) VALUES
(101, 101, 1, 'STU-2024-001', 1, '2024', 'regular', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 12:43:28'),
(102, 102, 2, 'STU-2024-002', 1, '2023', 'regular', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 12:43:28'),
(104, 109, NULL, 'LTM-S4-26-001', 4, '2026', 'regular', NULL, 'ali', '984323456788', '0334656878', '234678997646', NULL, '2026-05-07 10:58:28'),
(105, 173, NULL, 'LTM-S3-26-001', 3, '2026', 'regular', NULL, 'adeel', '93973682892', '032492891', '93872829929', NULL, '2026-05-18 12:07:47'),
(106, 174, NULL, 'LTM-S5-26-001', 5, '2026', 'regular', NULL, 'abdullah', '034983742233', '03882999333 ', '98989809898', 'Matric', '2026-05-18 12:08:46'),
(107, 175, NULL, 'LTM-S4-26-002', 4, '2026', 'regular', NULL, 'faheem', '2018232903892', '03291021092', '9283293829', NULL, '2026-05-18 12:09:39'),
(108, 176, NULL, 'LTM-S3-26-002', 3, '2026', 'regular', NULL, 'naeem', '021843293', NULL, '203219382', NULL, '2026-05-18 13:21:02'),
(109, 177, NULL, 'LTM-S1-26-001', 1, '2026', 'regular', NULL, 'shahrukh', '8372183728378', '03293898222', '237287382738832', NULL, '2026-05-20 18:22:55'),
(110, 178, NULL, 'LTM-S1-26-002', 1, '2026', 'regular', NULL, 'nouman', '323232323232445', '032223344', '4898493489374', NULL, '2026-05-20 18:27:57'),
(111, 187, NULL, 'ASI-S4-26-001', 4, '2026', 'regular', NULL, 'jamil', '9132362362736', '038277628', '219273293872', NULL, '2026-05-23 12:24:54');

-- --------------------------------------------------------

--
-- Table structure for table `student_classes`
--

CREATE TABLE `student_classes` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'approved',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_classes`
--

INSERT INTO `student_classes` (`id`, `student_id`, `class_id`, `status`, `assigned_at`) VALUES
(1, 104, 1, 'approved', '2026-05-07 13:45:35'),
(2, 104, 2, 'approved', '2026-05-08 13:32:15'),
(3, 104, 3, 'approved', '2026-05-20 18:16:35'),
(4, 104, 4, 'pending', '2026-05-20 18:20:26'),
(5, 109, 4, 'approved', '2026-05-20 18:22:55'),
(6, 109, 3, 'pending', '2026-05-20 18:23:30'),
(7, 109, 1, 'pending', '2026-05-20 18:25:22'),
(8, 109, 2, 'pending', '2026-05-20 18:25:36'),
(9, 110, 4, 'approved', '2026-05-20 18:27:57'),
(10, 110, 2, 'pending', '2026-05-20 18:28:10'),
(11, 110, 1, 'pending', '2026-05-20 18:28:52'),
(12, 110, 3, 'pending', '2026-05-20 18:28:54'),
(13, 111, 5, 'approved', '2026-05-23 12:25:30');

-- --------------------------------------------------------

--
-- Table structure for table `student_progress`
--

CREATE TABLE `student_progress` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `progress_percent` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_risk_assessments`
--

CREATE TABLE `student_risk_assessments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `risk_level` enum('low','medium','high','critical') DEFAULT 'low',
  `warning_score` decimal(5,2) DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `flagged_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `submitted_file_name` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `submission_text`, `file_url`, `file_path`, `submitted_file_name`, `submitted_at`, `marks_obtained`, `feedback`, `graded_by`, `graded_at`, `updated_at`) VALUES
(2, 1, 104, 'ok sir', NULL, 'C:\\Users\\I.s computer\\Desktop\\All webiste\\Lancers tech Lms\\backend\\uploads\\submissions\\submission-1778165716765-273558633.png', 'linkedin.png', '2026-05-07 14:55:16', 62.00, 'Good ', 3, '2026-05-08 18:19:06', '2026-05-08 18:19:06');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetables`
--

CREATE TABLE `timetables` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(100) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `semester` varchar(20) DEFAULT 'Fall'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timetables`
--

INSERT INTO `timetables` (`id`, `class_id`, `course_id`, `teacher_id`, `campus_id`, `day_of_week`, `start_time`, `end_time`, `room_number`, `academic_year`, `semester`) VALUES
(10, 1, 2, 3, 1, 'Monday', '09:00:00', '11:00:00', '', '2024-2025', 'Fall'),
(11, 1, 2, 3, 1, 'Tuesday', '09:00:00', '11:00:00', 'B', '2024-2025', 'Fall'),
(12, 2, 3, 3, 1, 'Wednesday', '09:02:00', '11:04:00', 'C', '2024-2025', 'Fall');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'student',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `is_approved` tinyint(1) DEFAULT 0,
  `campus_id` int(11) DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`, `is_approved`, `campus_id`, `profile_image`, `last_login`, `created_at`, `updated_at`, `client_id`) VALUES
(1, 'Lancers Nexus Root', 'nexus.admin@lancerstech.com', NULL, '$2b$10$mn5nhILwVQ6jY2.KkmAIRe5NJbvrB5XT8x.87GUGsyndBbticTJde', 'super_admin', 'active', 1, 1, NULL, NULL, '2026-05-01 21:06:39', '2026-05-21 20:59:57', 4),
(2, 'Nouman HOD', 'nouman@gmail.com', NULL, '$2b$10$tQw.V1TIsZDxgoaVTX34KuShURLOPTMV9jBPaM9712zrwBKAE24ua', 'principal', 'active', 1, 1, NULL, NULL, '2026-05-01 21:06:39', '2026-05-21 20:59:57', 4),
(3, 'Finance Manager', 'finance@lancerstech.com', NULL, '$2b$12$dPesmkdZy6hF7PmluJDZUORtb7BQX.sn1CzLDD/hnbogwT7tVKywC', 'finance_manager', 'active', 1, 1, NULL, NULL, '2026-05-01 21:06:39', '2026-05-21 20:59:57', 4),
(5, 'HR', 'hr@gmail.com', NULL, '$2b$10$2kfVEjIjAhhzYmM0urjFyegFlwhVI6qKKy5BdhAZUSxjrCM8Rg0te', 'hr_manager', 'active', 1, 1, NULL, NULL, '2026-05-02 12:46:11', '2026-05-21 20:59:57', 4),
(6, 'shaheryar', 'shaheryar@gmial.com', NULL, '$2b$10$KtstxNTkztNq69gd/OOrauNanbvpw3LyIdeFEKgnZpHDnpcU2SXQ.', 'rector', 'active', 1, 1, NULL, NULL, '2026-05-04 10:32:01', '2026-05-21 20:59:57', 4),
(7, 'shahrukh', 'shahrukh@gmail.com', NULL, '$2b$10$MfKHao1P1PUoeCMeenJfkOjkTlLcfvbWeXNMbB/DdJ28u2iUuVk1S', 'registrar', 'active', 1, 1, NULL, NULL, '2026-05-04 12:14:35', '2026-05-21 20:59:57', 4),
(101, 'Emma Richardson', 'emma@student.com', NULL, 'pass', 'student', 'active', 0, NULL, NULL, NULL, '2026-05-04 12:43:28', '2026-05-21 20:59:57', 4),
(102, 'James Chen', 'james@student.com', NULL, 'pass', 'student', 'active', 0, NULL, NULL, NULL, '2026-05-04 12:43:28', '2026-05-21 20:59:57', 4),
(104, 'abdullah', 'abdullah@gmail.com', NULL, '$2b$10$arI8OzcOnRddnIxaMbvEKOApc/oOZvh4Sc.1tp2V80ZenA4GuSl6.', 'admission_officer', 'active', 1, 1, NULL, NULL, '2026-05-05 15:04:03', '2026-05-21 20:59:57', 4),
(105, 'rehan', 'rehan@gmail.com', NULL, '$2b$10$ydojWoMb3Ysw0MRJdVun5.EzjOl3cTZvj.2xPWYqM/2c1CKi7TA/e', 'librarian', 'active', 1, 1, NULL, NULL, '2026-05-05 15:48:02', '2026-05-21 20:59:57', 4),
(107, 'itaf', 'itaf@gmail.com', NULL, '$2b$10$Czj.Yq1GBBaKiCXbIka9KO8EmP2jy6c/7RVYAM3H0amu2uw8/rAQy', 'it_admin', 'active', 1, 1, NULL, NULL, '2026-05-05 19:14:32', '2026-05-21 20:59:57', 4),
(108, 'umer', 'umer@gmail.com', NULL, '$2b$10$poA4TqnPEXY0PoEGcKZk1e14U/4YxRd8AGqzZPOCjHFRPg72jRDC6', 'teacher', 'active', 1, 1, NULL, NULL, '2026-05-06 12:57:32', '2026-05-21 20:59:57', 4),
(109, 'talha', 'talha@gmail.com', NULL, '$2b$10$VNeS1oTsRae1/GrgFo6zUOlnU4NkZMkBYFc4ymMWyOF19rRGZw11q', 'student', 'active', 1, 1, NULL, NULL, '2026-05-07 10:58:28', '2026-05-21 20:59:57', 4),
(111, 'BD potel', 'bd@gmail.com', NULL, '$2b$12$Ufp1Me9ooQh4Hjs5RDMShuhusZNt0KIFiL42CM4FDg5.siMVDZDPG', 'bd_agent', 'active', 1, 1, NULL, NULL, '2026-05-14 14:14:28', '2026-05-21 20:59:57', 4),
(123, 'BD User', 'BD1@gmail.com', NULL, '$2b$12$VURBjBM6xQfkYwKaabrWNOcaSXqtG2OMHNiFocXaei0hwkW5Vqh1W', 'bd_agent', 'active', 1, 9, NULL, NULL, '2026-05-16 13:48:47', '2026-05-21 20:59:57', 4),
(124, 'BD', 'bd2@gmail.com', NULL, '$2b$12$oQfHQTq5YIzF/.5epLLGtu6CxObPdWDoZ68OPSXSNPQrN1IE2hcE.', 'bd_agent', 'active', 1, 11, NULL, NULL, '2026-05-16 13:49:06', '2026-05-21 20:59:57', 4),
(129, 'HR Manager', 'hr2@gmail.com', NULL, '$2b$12$UTGTKd//EmU7NDS5fZV7beNdOn9EGAAvK9UrszxTE0jF6imXhcOsm', 'hr_manager', 'active', 1, 9, NULL, NULL, '2026-05-16 13:50:45', '2026-05-21 20:59:57', 4),
(130, 'HR Manager', 'hr3@gmail.com', NULL, '$2b$12$ZASl53ZSf7dZ093oaTB6NuvfSNM3prflIC4FsQASWzYJAz0joYusK', 'hr_manager', 'active', 1, 10, NULL, NULL, '2026-05-16 13:51:07', '2026-05-21 20:59:57', 4),
(131, 'HR Manager', 'h43@gmail.com', NULL, '$2b$12$mpqz7rlQKooxelol1Ix5ZObUBkabFMFgQmMkcHwsFR.u//jpdPswa', 'hr_manager', 'active', 1, 10, NULL, NULL, '2026-05-16 13:51:41', '2026-05-21 20:59:57', 4),
(132, 'hr', 'hr5@gmail.com', NULL, '$2b$12$zf5Q6wcOmKoXLhTBUQGhReS/C.y1nYJBySitTTdH3UjjtSVeFDXDq', 'hr_manager', 'active', 1, 11, NULL, NULL, '2026-05-16 13:52:04', '2026-05-21 20:59:57', 4),
(133, 'HR Manager', 'hr6@gmail.com', NULL, '$2b$12$nIbHvj6vaGU9v8JnsOlHn.Bz1MhW0vo/35ZcnZKpIG6KwRgH5S8RW', 'hr_manager', 'active', 1, 12, NULL, NULL, '2026-05-16 13:52:23', '2026-05-21 20:59:57', 4),
(135, 'Finance Manager', 'Finance3@gmail.com', NULL, '$2b$12$NoDxPHukRGvw5PNHFAq5leo0rZwLWzgS6uPTwlXSs4xnUbH/Dpe0q', 'finance_manager', 'active', 1, 9, NULL, NULL, '2026-05-16 13:53:22', '2026-05-21 20:59:57', 4),
(136, 'Finance Manager', 'Financeanager@gmail.com', NULL, '$2b$12$f6paNhLh.i2tE4JxRZXDJOO7FI7iIa82GBdcD9ehQNUY1OrjdZ17m', 'finance_manager', 'active', 1, 10, NULL, NULL, '2026-05-16 13:53:49', '2026-05-21 20:59:57', 4),
(137, 'Finance Manager', 'Finance5@gmail.com', NULL, '$2b$12$8kaP2fhBlQpt0292P3HSCu35SOO/n0Yd2NZMO.P33VmHvZLGJRsnO', 'finance_manager', 'active', 1, 11, NULL, NULL, '2026-05-16 13:54:09', '2026-05-21 20:59:57', 4),
(138, 'Finance Manager', 'Finance6@gmail.com', NULL, '$2b$12$xelC7PWgFrImXqOCpG5QoegsKwIk9.B2ZTzOUCR.allimeGp35si6', 'finance_manager', 'active', 1, 12, NULL, NULL, '2026-05-16 13:54:41', '2026-05-21 20:59:57', 4),
(139, 'Registrar', 'Registrar@gmail.com', NULL, '$2b$12$TmpFNPppsyDN388mIQigTuAWAn3ckNMG1nOwdbyOeVY2qkNczKl.S', 'registrar', 'active', 1, 9, NULL, NULL, '2026-05-16 13:55:05', '2026-05-21 20:59:57', 4),
(141, 'Registrar', 'Registrar3@gmail.com', NULL, '$2b$12$S7oJxJUHQAsefNwjy4WL1./pnHUww03zCGv96z2Tue5BlPknvjU/.', 'registrar', 'active', 1, 10, NULL, NULL, '2026-05-16 13:55:44', '2026-05-21 20:59:57', 4),
(142, 'Registrar', 'Registrar6@gmail.com', NULL, '$2b$12$S7jtEgmjynMvOfpsaQzIZ.DUGo7y1nZi2uq2ACyIsca1zIV.PAD0C', 'registrar', 'active', 1, 11, NULL, NULL, '2026-05-16 13:56:03', '2026-05-21 20:59:57', 4),
(143, 'Registrar', 'Registrar7@gmail.com', NULL, '$2b$12$VwWSWrm5viqS1pmcS811Y.2nwsmSeRLjFmPXj7GvwKoHuBCorqmA2', 'registrar', 'active', 1, 12, NULL, NULL, '2026-05-16 13:56:25', '2026-05-21 20:59:57', 4),
(144, ' Admission', 'Admission@gmail.com', NULL, '$2b$12$HLU3OxvcwAk2saYPZ76AyOAI3AScqcqDlnB7OKT/vQNnIFC3b8S8e', 'admission_officer', 'active', 1, 9, NULL, NULL, '2026-05-16 13:56:52', '2026-05-21 20:59:57', 4),
(145, ' Admission', 'Admission3@gmail.com', NULL, '$2b$12$mgsvqitkqukLEnRsuYOPZ.0aygeoBVbLsAob1Ff4yMWnwGJm21Ysa', 'admission_officer', 'active', 1, 10, NULL, NULL, '2026-05-16 13:57:11', '2026-05-21 20:59:57', 4),
(146, ' Admission', 'Admission5@gmail.com', NULL, '$2b$12$rotadHspBpLNMEMwZJzz1OgyHeMyHgJVJLGMrp4OAT.GfxDpAO6tK', 'admission_officer', 'active', 1, 11, NULL, NULL, '2026-05-16 13:57:34', '2026-05-21 20:59:57', 4),
(147, ' Admission', 'Admission7@gmail.com', NULL, '$2b$12$KsMtGUlQ5yhE13WImSpPVOGYW/YuH2c0Qj6eh.ii02PtXTYnVTIfi', 'admission_officer', 'active', 1, 12, NULL, NULL, '2026-05-16 13:57:59', '2026-05-21 20:59:57', 4),
(148, 'Exam ', 'Exam1@gmail.com', NULL, '$2b$12$4ZqkYOwEno3khcQ4Q.TpueosydHIPX2RDXWHgdAHqLWBrXpwvlef6', 'exam_controller', 'active', 1, 1, NULL, NULL, '2026-05-16 13:58:23', '2026-05-21 20:59:57', 4),
(150, 'Exam ', 'Exam3@gmail.com', NULL, '$2b$12$aQK9q2v5MPjRApVpZkY9iO8fabtnXEp7Du1B3HpPGUjMO80LmAHJ6', 'exam_controller', 'active', 1, 9, NULL, NULL, '2026-05-16 13:58:58', '2026-05-21 20:59:57', 4),
(151, 'Exam ', 'Exam5@gmail.com', NULL, '$2b$12$SQ2ChzzKqCHthsLmFo1fb.JCa3S.PsxvhTlLvj2G5hBgRrawTIdJK', 'exam_controller', 'active', 1, 10, NULL, NULL, '2026-05-16 13:59:19', '2026-05-21 20:59:57', 4),
(152, 'Exam ', 'Exam4@gmail.com', NULL, '$2b$12$5xB271vSPJ08xac0zLE6CuP9pwMPj58j9.HGTLWR40UsvFD.B9zG.', 'exam_controller', 'active', 1, 11, NULL, NULL, '2026-05-16 13:59:40', '2026-05-21 20:59:57', 4),
(153, 'Exam ', 'Exam6@gmail.com', NULL, '$2b$12$sjaGsI3R6hemNsh8HxrjSeHgyD15QB8mXbxFaP/bGVAHZWvXjLXcu', 'exam_controller', 'active', 1, 12, NULL, NULL, '2026-05-16 14:00:01', '2026-05-21 20:59:57', 4),
(155, 'Librarian', 'Librarian2@gmail.com', NULL, '$2b$12$pETaZZUNjx9jTLII5lfi1uJeB50DwxmfhxYi0pTAqJ3CkXmfJw6SG', 'librarian', 'active', 1, 9, NULL, NULL, '2026-05-16 14:00:39', '2026-05-21 20:59:57', 4),
(156, 'Librarian', 'Librarian3@gmail.com', NULL, '$2b$12$Mj6O6AEulubDGQ02XmIPxe1XRzyOXoNIWOCbyfjbKP9EJHxLrad9y', 'librarian', 'active', 1, 10, NULL, NULL, '2026-05-16 14:01:02', '2026-05-21 20:59:57', 4),
(157, 'Librarian', 'Librarian4@gmail.com', NULL, '$2b$12$fU9BQ1xP7zoa3lPTSQX1g./Od0PYmBfXsmE4puDYXGNjB.1J.fRkq', 'librarian', 'active', 1, 11, NULL, NULL, '2026-05-16 14:01:16', '2026-05-21 20:59:57', 4),
(158, 'Librarian', 'Librarian5@gmail.com', NULL, '$2b$12$jqqmsMGwKP0ZYuht5Xf1q.Fwt/ue83QChVkEMduxUz7fIIw7Sjci.', 'librarian', 'active', 1, 12, NULL, NULL, '2026-05-16 14:01:35', '2026-05-21 20:59:57', 4),
(159, ' IT', 'IT@gmail.com', NULL, '$2b$12$x.l3/B3NzkPGy8R.tqSuNuFhr.DY.TzhTaS4NvUFoNN4eG8ziJLhC', 'it_admin', 'active', 1, 9, NULL, NULL, '2026-05-16 14:01:55', '2026-05-21 20:59:57', 4),
(160, ' IT', 'IT2@gmail.com', NULL, '$2b$12$bND3RaecnErVmYWrH4SbxOjVUA8oaucqwbz8KTARGo27N3N/U7vIi', 'it_admin', 'active', 1, 11, NULL, NULL, '2026-05-16 14:02:12', '2026-05-21 20:59:57', 4),
(161, ' IT', 'IT3@gmail.com', NULL, '$2b$12$xhY9YCY9csg0a74K0k6FWeKTQ.IhpzxslnLn7Odz/y4M8Bb.QnlIa', 'it_admin', 'active', 1, 12, NULL, NULL, '2026-05-16 14:02:28', '2026-05-21 20:59:57', 4),
(162, 'Rectorate ', 'Rectorate@gmail.com', NULL, '$2b$12$kJFTQ/xfZMMOLKsoWJTu1eQFrPXLDztFYCRHWNsDCm3RZ.L4AyaZu', 'rector', 'active', 1, 12, NULL, NULL, '2026-05-16 14:16:50', '2026-05-21 20:59:57', 4),
(163, 'Rectorate ', 'Rectorate2@gmail.com', NULL, '$2b$12$P9hlV9H/4aQTNu7QtUagjO.PeF4d1PWrkgjmSMc.0X3KZwzPJX2b2', 'rector', 'active', 1, 11, NULL, NULL, '2026-05-16 14:17:08', '2026-05-21 20:59:57', 4),
(164, 'Rectorate ', 'Rectorate3@gmail.com', NULL, '$2b$12$80a41jLwcEZXxUhFheiGreYFZlZR0AImX7jkL2aNBJFWc/CQ4gpyS', 'rector', 'active', 1, 9, NULL, NULL, '2026-05-16 14:17:28', '2026-05-21 20:59:57', 4),
(165, 'Rectorate ', 'Rectorate5@gmail.com', NULL, '$2b$12$mffkDlfjrqebTN9gbiZ3oOHh0J4eUT/CrDO5P5hjPMYOv6QVyDnaa', 'rector', 'active', 1, 10, NULL, NULL, '2026-05-16 14:17:55', '2026-05-21 20:59:57', 4),
(166, 'Dean', 'Dean1@gmail.com', NULL, '$2b$12$WJtJOak34.IbKArFOXkNXuPIo40L7pcX59dqMjBaP9xbQkmxuxTBS', 'principal', 'active', 1, 12, NULL, NULL, '2026-05-16 14:18:39', '2026-05-21 20:59:57', 4),
(167, 'Dean', 'Dean2@gmail.com', NULL, '$2b$12$Ni0waDpzCjuTKVd.z4wTJutsV0ZI4F3TsnVRjiW36jSAdpCyPBNTO', 'principal', 'active', 1, 11, NULL, NULL, '2026-05-16 14:18:58', '2026-05-21 20:59:57', 4),
(168, 'Dean', 'Dean3@gmail.com', NULL, '$2b$12$kQ7J.OibPVHP3V3kVvt11OD6oBROWbH7PY4/6ikqOE.4YunCGWuJS', 'principal', 'active', 1, 10, NULL, NULL, '2026-05-16 14:19:20', '2026-05-21 20:59:57', 4),
(169, 'Adeel ', 'adeel@gmail.com', NULL, '$2b$12$l/ErlyajUnb8tGj7JBGaw.YWJ.BEuMfd8BN4.L45dAeaIPdpdYZyG', 'teacher', 'active', 1, 1, NULL, NULL, '2026-05-18 12:05:35', '2026-05-21 20:59:57', 4),
(171, 'Azam', 'azam@gmail.com', NULL, '$2b$12$EOzVGp8ZU4Fg6zJLo9IDrehtdn4LY8nprZLM5fjzO/xZUbMYCMWDi', 'teacher', 'active', 1, 1, NULL, NULL, '2026-05-18 12:06:03', '2026-05-21 20:59:57', 4),
(173, 'Adeel', 'adeel12@gmail.com', NULL, '$2b$12$XOX5bZnjLy1jimC8PcYiLe8dvdXTEs5Awn6ZCxFAfHldxUbc3HpM.', 'student', 'active', 1, 1, NULL, NULL, '2026-05-18 12:07:47', '2026-05-21 20:59:57', 4),
(174, 'Abid', 'abid@gmail.com', NULL, '$2b$12$..lZ4OFdm8YG4rBI4glOUOV7s3fVtFFEgA/H.IG52cDqxlOcqjAyy', 'student', 'active', 1, 1, NULL, NULL, '2026-05-18 12:08:46', '2026-05-21 20:59:57', 4),
(175, 'Aon', 'Aon@gmail.com', NULL, '$2b$12$jKosW47Glj2vJys6OPaFT.JfVSC9A3pBQB3JEmPGDyG8Akv53ewj6', 'student', 'active', 1, 1, NULL, NULL, '2026-05-18 12:09:39', '2026-05-21 20:59:57', 4),
(176, 'shahrukh', 'shahrukh12@gmail..com', NULL, '$2b$10$ji/Dy8veAGXRqYf/Aus2Wu.hL/6T4q1s/zcuXZ//iAHXJYDYUBjCC', 'student', 'active', 1, 1, NULL, NULL, '2026-05-18 13:21:02', '2026-05-21 20:59:57', 4),
(177, 'sara', 'sara@gmail.com', NULL, '$2b$12$YT8r9ANKV2.10BDYr.ioyuRos/QRqUKOsrqGvpf9jGKiXL.tGQggq', 'student', 'active', 1, 1, NULL, NULL, '2026-05-20 18:22:55', '2026-05-21 20:59:57', 4),
(178, 'rehantariq', 'rehantariq@gmail.com', NULL, '$2b$12$6Jc6vcd0CSdQJIMNd0htxuUsTFAIwyfHcuFLsJLrGR/lyTxngWJGC', 'student', 'active', 1, 1, NULL, NULL, '2026-05-20 18:27:57', '2026-05-21 20:59:57', 4),
(179, 'Lancers Tech Owner', 'master@lancerstech.com', NULL, '$2b$10$LH/gjlMiyH9ENW1fKMF/DemIN/ukT5qEOWIcQir4zurQUcPXp8EQq', 'master_admin', 'active', 0, NULL, NULL, NULL, '2026-05-21 13:32:23', '2026-05-21 13:32:23', NULL),
(182, 'Shahrukh farooq', 'shahrukhfarooq@gmail.com', NULL, '$2b$10$OoivYxddkW/sPsdB6MTRfOfCCyfnPxHiB3p66hPkSd0rXxc9LmcU2', 'super_admin', 'active', 0, 1, NULL, NULL, '2026-05-22 20:37:29', '2026-05-22 20:37:29', 7),
(183, 'HOD', 'asiahod@gmail.com', NULL, '$2b$12$16E9h/m/G0ywKkm2tbcg8.R1uJtRFtriHnIi1H259HwB82iok2JWS', 'principal', 'active', 1, 15, NULL, NULL, '2026-05-22 20:40:26', '2026-05-22 20:40:26', 7),
(184, 'khan', 'khan@gmail.com', NULL, '$2b$12$QgOWRc446CowBXhN2avqTOhNDTh5MsplLB2NgzAlXvOTOMX9z8DOC', 'teacher', 'active', 1, 15, NULL, NULL, '2026-05-22 21:05:53', '2026-05-22 21:21:07', 7),
(187, 'Noumanjamil', 'noumanjamil@gmail.com', NULL, '$2b$12$9Lx9vwx.4YU5ypuG5VIGKerF9xFR2iLL.n2LSYndYbT6dkmWD5jNW', 'student', 'active', 1, 15, NULL, NULL, '2026-05-23 12:24:54', '2026-05-23 12:24:54', 7),
(188, 'drabdullah', 'drabdullah@gmail.com', NULL, '$2b$12$DWc2yTeCNSLIsj.5wLnLSupcLSvczyMhkPv/3xcSzhcmVnUC7dUwa', 'rector', 'active', 1, 15, NULL, NULL, '2026-05-23 14:22:59', '2026-05-23 14:22:59', 7),
(189, 'shaheryar', 'shaheryar@gmail.com', NULL, '$2b$10$NtUQtm8wvGefwv0MEKF0D.jFiqdWEnUufItzFao7bxO.vTfF/qiu.', 'super_admin', 'active', 0, 1, NULL, NULL, '2026-05-25 22:03:30', '2026-05-25 22:03:30', 8);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admission_applications`
--
ALTER TABLE `admission_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admission_documents`
--
ALTER TABLE `admission_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `admission_interviews`
--
ALTER TABLE `admission_interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `admission_logs`
--
ALTER TABLE `admission_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_att` (`student_id`,`course_id`,`date`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `fk_attendance_class` (`class_id`),
  ADD KEY `fk_attendance_teacher` (`teacher_id`);

--
-- Indexes for table `bd_applicants`
--
ALTER TABLE `bd_applicants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `bd_bulk_hires`
--
ALTER TABLE `bd_bulk_hires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `bd_campus_leads`
--
ALTER TABLE `bd_campus_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `bd_job_postings`
--
ALTER TABLE `bd_job_postings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invite_token` (`invite_token`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`);

--
-- Indexes for table `book_issues`
--
ALTER TABLE `book_issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `campuses`
--
ALTER TABLE `campuses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_campus_client` (`client_id`);

--
-- Indexes for table `challans`
--
ALTER TABLE `challans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `class_courses`
--
ALTER TABLE `class_courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `client_invoices`
--
ALTER TABLE `client_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `course_reports`
--
ALTER TABLE `course_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `campus_id` (`campus_id`),
  ADD KEY `fk_dept_client` (`client_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_faculty_client` (`client_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `lab_id` (`lab_id`);

--
-- Indexes for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `fee_payments`
--
ALTER TABLE `fee_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `finance_challans`
--
ALTER TABLE `finance_challans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `finance_expenses`
--
ALTER TABLE `finance_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `finance_payroll`
--
ALTER TABLE `finance_payroll`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `hr_job_postings`
--
ALTER TABLE `hr_job_postings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hr_leave_requests`
--
ALTER TABLE `hr_leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `institutional_kpis`
--
ALTER TABLE `institutional_kpis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `it_audit_logs`
--
ALTER TABLE `it_audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `it_system_config`
--
ALTER TABLE `it_system_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`);

--
-- Indexes for table `it_tickets`
--
ALTER TABLE `it_tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `labs`
--
ALTER TABLE `labs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `lab_usage`
--
ALTER TABLE `lab_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `lab_id` (`lab_id`);

--
-- Indexes for table `lancers_clients`
--
ALTER TABLE `lancers_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `domain` (`domain`),
  ADD UNIQUE KEY `admin_email` (`admin_email`);

--
-- Indexes for table `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`);

--
-- Indexes for table `library_members`
--
ALTER TABLE `library_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `library_transactions`
--
ALTER TABLE `library_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `marks`
--
ALTER TABLE `marks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `registrar_degrees`
--
ALTER TABLE `registrar_degrees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `registrar_degree_verifications`
--
ALTER TABLE `registrar_degree_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `degree_id` (`degree_id`);

--
-- Indexes for table `registrar_transcript_requests`
--
ALTER TABLE `registrar_transcript_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `research_projects`
--
ALTER TABLE `research_projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roll_number` (`roll_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_class` (`student_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `student_progress`
--
ALTER TABLE `student_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `student_risk_assessments`
--
ALTER TABLE `student_risk_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sub` (`assignment_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `campus_id` (`campus_id`),
  ADD KEY `fk_user_client` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admission_applications`
--
ALTER TABLE `admission_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `admission_documents`
--
ALTER TABLE `admission_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `admission_interviews`
--
ALTER TABLE `admission_interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admission_logs`
--
ALTER TABLE `admission_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `bd_applicants`
--
ALTER TABLE `bd_applicants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bd_bulk_hires`
--
ALTER TABLE `bd_bulk_hires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bd_campus_leads`
--
ALTER TABLE `bd_campus_leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bd_job_postings`
--
ALTER TABLE `bd_job_postings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `book_issues`
--
ALTER TABLE `book_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `campuses`
--
ALTER TABLE `campuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `challans`
--
ALTER TABLE `challans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `class_courses`
--
ALTER TABLE `class_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_invoices`
--
ALTER TABLE `client_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_reports`
--
ALTER TABLE `course_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exam_results`
--
ALTER TABLE `exam_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_payments`
--
ALTER TABLE `fee_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `finance_challans`
--
ALTER TABLE `finance_challans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `finance_expenses`
--
ALTER TABLE `finance_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `finance_payroll`
--
ALTER TABLE `finance_payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hr_job_postings`
--
ALTER TABLE `hr_job_postings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hr_leave_requests`
--
ALTER TABLE `hr_leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `institutional_kpis`
--
ALTER TABLE `institutional_kpis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `it_audit_logs`
--
ALTER TABLE `it_audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `it_system_config`
--
ALTER TABLE `it_system_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `it_tickets`
--
ALTER TABLE `it_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `labs`
--
ALTER TABLE `labs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lab_usage`
--
ALTER TABLE `lab_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lancers_clients`
--
ALTER TABLE `lancers_clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `library_books`
--
ALTER TABLE `library_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `library_members`
--
ALTER TABLE `library_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `library_transactions`
--
ALTER TABLE `library_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `marks`
--
ALTER TABLE `marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `registrar_degrees`
--
ALTER TABLE `registrar_degrees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `registrar_degree_verifications`
--
ALTER TABLE `registrar_degree_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `registrar_transcript_requests`
--
ALTER TABLE `registrar_transcript_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `research_projects`
--
ALTER TABLE `research_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `student_progress`
--
ALTER TABLE `student_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_risk_assessments`
--
ALTER TABLE `student_risk_assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetables`
--
ALTER TABLE `timetables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=190;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admission_documents`
--
ALTER TABLE `admission_documents`
  ADD CONSTRAINT `admission_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admission_interviews`
--
ALTER TABLE `admission_interviews`
  ADD CONSTRAINT `admission_interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bd_applicants`
--
ALTER TABLE `bd_applicants`
  ADD CONSTRAINT `bd_applicants_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `bd_job_postings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bd_bulk_hires`
--
ALTER TABLE `bd_bulk_hires`
  ADD CONSTRAINT `bd_bulk_hires_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bd_campus_leads`
--
ALTER TABLE `bd_campus_leads`
  ADD CONSTRAINT `bd_campus_leads_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bd_job_postings`
--
ALTER TABLE `bd_job_postings`
  ADD CONSTRAINT `bd_job_postings_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `book_issues`
--
ALTER TABLE `book_issues`
  ADD CONSTRAINT `book_issues_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_issues_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `campuses`
--
ALTER TABLE `campuses`
  ADD CONSTRAINT `fk_campus_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `challans`
--
ALTER TABLE `challans`
  ADD CONSTRAINT `challans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class_courses`
--
ALTER TABLE `class_courses`
  ADD CONSTRAINT `class_courses_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_courses_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `client_invoices`
--
ALTER TABLE `client_invoices`
  ADD CONSTRAINT `client_invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dept_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculties`
--
ALTER TABLE `faculties`
  ADD CONSTRAINT `fk_faculty_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `feedback_ibfk_3` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  ADD CONSTRAINT `fee_invoices_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_payments`
--
ALTER TABLE `fee_payments`
  ADD CONSTRAINT `fee_payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD CONSTRAINT `fee_structures_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `finance_challans`
--
ALTER TABLE `finance_challans`
  ADD CONSTRAINT `finance_challans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `finance_challans_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `finance_expenses`
--
ALTER TABLE `finance_expenses`
  ADD CONSTRAINT `finance_expenses_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `finance_payroll`
--
ALTER TABLE `finance_payroll`
  ADD CONSTRAINT `finance_payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `finance_payroll_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hr_leave_requests`
--
ALTER TABLE `hr_leave_requests`
  ADD CONSTRAINT `hr_leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `institutional_kpis`
--
ALTER TABLE `institutional_kpis`
  ADD CONSTRAINT `institutional_kpis_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `labs`
--
ALTER TABLE `labs`
  ADD CONSTRAINT `labs_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `labs_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lab_usage`
--
ALTER TABLE `lab_usage`
  ADD CONSTRAINT `lab_usage_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lab_usage_ibfk_2` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `library_transactions`
--
ALTER TABLE `library_transactions`
  ADD CONSTRAINT `library_transactions_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`),
  ADD CONSTRAINT `library_transactions_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `library_members` (`id`);

--
-- Constraints for table `marks`
--
ALTER TABLE `marks`
  ADD CONSTRAINT `marks_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `programs`
--
ALTER TABLE `programs`
  ADD CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `registrar_degrees`
--
ALTER TABLE `registrar_degrees`
  ADD CONSTRAINT `registrar_degrees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `registrar_degree_verifications`
--
ALTER TABLE `registrar_degree_verifications`
  ADD CONSTRAINT `registrar_degree_verifications_ibfk_1` FOREIGN KEY (`degree_id`) REFERENCES `registrar_degrees` (`id`);

--
-- Constraints for table `registrar_transcript_requests`
--
ALTER TABLE `registrar_transcript_requests`
  ADD CONSTRAINT `registrar_transcript_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_progress`
--
ALTER TABLE `student_progress`
  ADD CONSTRAINT `student_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_risk_assessments`
--
ALTER TABLE `student_risk_assessments`
  ADD CONSTRAINT `student_risk_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `system_logs_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `timetables`
--
ALTER TABLE `timetables`
  ADD CONSTRAINT `timetables_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_4` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
