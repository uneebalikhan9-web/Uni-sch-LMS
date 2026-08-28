-- ULTIMATE COMPLETE CLEAN LMS DATABASE DUMP
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `admission_applications`;
CREATE TABLE `admission_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `stage` enum('Lead','Applied','Shortlisted','Interview','Merit List','Admitted') DEFAULT 'Lead',
  `score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `campus_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admission_applications` (`id`, `name`, `email`, `phone`, `program_id`, `stage`, `score`, `created_at`, `campus_id`) VALUES
(1, 'Emma Watson', 'emma@example.com', NULL, 1, 'Lead', '85.00', '2026-05-05 14:52:14', 1),
(2, 'James Wilson', 'james@example.com', NULL, 2, 'Lead', '78.00', '2026-05-05 14:52:14', 1),
(3, 'Sophia Lee', 'sophia@example.com', NULL, 3, 'Applied', '92.00', '2026-05-05 14:52:14', 1),
(4, 'Oliver Chen', 'oliver@example.com', NULL, 1, 'Applied', '88.00', '2026-05-05 14:52:14', 1),
(5, 'Liam Brown', 'liam@example.com', NULL, 1, 'Interview', '91.00', '2026-05-05 14:52:14', 1),
(6, 'Noah Anderson', 'noah@example.com', NULL, 3, 'Merit List', '96.00', '2026-05-05 14:52:14', 1),
(7, 'Lucas Jackson', 'lucas@example.com', NULL, 1, 'Admitted', '95.00', '2026-05-05 14:52:14', 1),
(9, 'umer', 'umer2@gmail.com', '03244931994', NULL, 'Applied', '80.00', '2026-06-02 21:08:31', 16);

DROP TABLE IF EXISTS `admission_documents`;
CREATE TABLE `admission_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `campus_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `admission_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admission_documents` (`id`, `application_id`, `document_type`, `status`, `notes`, `created_at`, `campus_id`) VALUES
(1, 3, 'Intermediate Transcript', 'verified', 'Awaiting transcript verification', '2026-05-19 16:36:26', 1),
(2, 3, 'Matric Certificate', 'verified', 'Verified with board', '2026-05-19 16:36:26', 1),
(3, 4, 'High School Diploma', 'rejected', 'Requires IBCC equivalence', '2026-05-19 16:36:26', 1),
(4, 5, 'A-Level Result Card', 'verified', 'Grade sheet matched with Cambridge database', '2026-05-19 16:36:26', 1),
(5, 6, 'CNIC / Form-B Copy', 'pending', 'Needs physical copy matching', '2026-05-19 16:36:26', 1),
(6, 7, 'FSc Transcripts', 'verified', 'Final board verification complete', '2026-05-19 16:36:26', 1);

DROP TABLE IF EXISTS `admission_interviews`;
CREATE TABLE `admission_interviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) DEFAULT NULL,
  `interview_date` date DEFAULT NULL,
  `interview_time` time DEFAULT NULL,
  `interviewer` varchar(255) DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `campus_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `admission_interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admission_interviews` (`id`, `application_id`, `interview_date`, `interview_time`, `interviewer`, `status`, `campus_id`) VALUES
(1, 5, '2025-03-19 19:00:00', '10:00:00', 'Prof. Johnson', 'Scheduled', 1),
(2, 3, '2025-03-20 19:00:00', '11:30:00', 'Dr. Smith', 'Scheduled', 1);

DROP TABLE IF EXISTS `admission_logs`;
CREATE TABLE `admission_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_text` varchar(255) NOT NULL,
  `action_type` enum('application','interview','verification','merit','other') DEFAULT 'other',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `campus_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admission_logs` (`id`, `action_text`, `action_type`, `created_at`, `campus_id`) VALUES
(1, 'Emma Watson submitted initial lead', 'application', '2026-05-05 15:32:15', 1),
(2, 'Liam Brown interview scheduled with Prof. Johnson', 'interview', '2026-05-05 15:32:15', 1),
(3, 'Noah Anderson moved to Merit List', 'merit', '2026-05-05 15:32:15', 1),
(4, 'Lucas Jackson admission confirmed', 'application', '2026-05-05 15:32:15', 1),
(5, 'Sophia Lee document verification pending', 'verification', '2026-05-05 15:32:15', 1),
(6, 'Added candidate umer in stage Applied', 'application', '2026-06-02 21:11:25', 16),
(7, 'Generated Matric and Intermediate certificate verification tasks.', 'verification', '2026-06-02 21:11:25', 16),
(8, 'Document "Intermediate Transcript" for umer was marked as rejected.', 'verification', '2026-06-02 21:12:03', 16),
(9, 'Moved umer to Interview', 'application', '2026-06-02 21:13:07', 16),
(10, 'Moved umer to Merit List', 'application', '2026-06-02 21:14:33', 16),
(11, 'Moved umer to Interview', 'application', '2026-06-02 21:14:37', 16),
(12, 'Deleted candidate umer', 'application', '2026-06-02 21:21:46', 16),
(13, 'Deleted candidate umer', 'application', '2026-06-02 21:21:49', 16),
(14, 'Deleted candidate umer', 'application', '2026-06-02 21:21:54', 16),
(15, 'Deleted candidate umer', 'application', '2026-06-27 19:07:08', 16),
(16, 'Document "High School Diploma" for Oliver Chen was marked as rejected.', 'verification', '2026-07-02 16:00:11', 1);

DROP TABLE IF EXISTS `admission_requests`;
CREATE TABLE `admission_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `emergency_relation` varchar(50) DEFAULT NULL,
  `last_qualification` varchar(100) DEFAULT NULL,
  `board_university` varchar(100) DEFAULT NULL,
  `passing_year` varchar(10) DEFAULT NULL,
  `marks_gpa` varchar(20) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `preferred_shift` varchar(20) DEFAULT NULL,
  `medical_condition` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `status` enum('pending_fee','fee_verified','admitted','rejected','pending','approved') DEFAULT 'pending_fee',
  `reviewed_by` int(11) DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `bform_number` varchar(30) DEFAULT NULL,
  `father_cnic` varchar(30) DEFAULT NULL,
  `father_phone` varchar(30) DEFAULT NULL,
  `target_class` varchar(50) DEFAULT NULL,
  `admission_fee` decimal(10,2) DEFAULT 5000.00,
  `fee_status` enum('pending','paid','waived') DEFAULT 'pending',
  `fee_paid_at` timestamp NULL DEFAULT NULL,
  `fee_verified_by` int(11) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `assigned_class_id` int(11) DEFAULT NULL,
  `assigned_section` varchar(50) DEFAULT NULL,
  `assigned_roll_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admission_requests` (`id`, `full_name`, `father_name`, `dob`, `gender`, `cnic`, `religion`, `nationality`, `phone`, `email`, `address`, `city`, `emergency_name`, `emergency_phone`, `emergency_relation`, `last_qualification`, `board_university`, `passing_year`, `marks_gpa`, `program`, `preferred_shift`, `medical_condition`, `notes`, `photo_url`, `status`, `reviewed_by`, `review_note`, `campus_id`, `created_at`, `bform_number`, `father_cnic`, `father_phone`, `target_class`, `admission_fee`, `fee_status`, `fee_paid_at`, `fee_verified_by`, `payment_method`, `assigned_class_id`, `assigned_section`, `assigned_roll_number`) VALUES
(1, 'Zubair Ahmed', 'Ahmed Bilal', '2015-04-09 19:00:00', 'Male', '35201-1122334-1', NULL, NULL, '0321-1234567', 'zubair.test@school.edu', 'Street 4, Gulberg', 'Lahore', NULL, NULL, NULL, 'Class 4 Passed', NULL, NULL, NULL, 'Class 5', NULL, NULL, 'Test walk-in admission', NULL, 'admitted', NULL, 'Approved & Enrolled by Principal', 20, '2026-08-20 11:47:19', '35201-1122334-1', '35201-9988776-3', '0321-1234567', 'Class 5', '5000.00', 'paid', '2026-08-20 11:47:19', NULL, 'Finance Cash Counter', NULL, 'Class 5 - Rose', 'STU-TEST-9208'),
(2, 'Nouman', 'Jimal khan', '2026-08-19 19:00:00', 'Male', '0947858394858', NULL, NULL, '03285756478', '', '', 'Lahore', NULL, NULL, NULL, '', NULL, NULL, NULL, 'Class 6', NULL, NULL, '', NULL, 'fee_verified', NULL, NULL, 20, '2026-08-20 12:00:44', '0947858394858', '09874524536', '03285756478', 'Class 6', '5000.00', 'paid', '2026-08-20 12:16:03', 220, 'Admissions Desk Cash', NULL, NULL, NULL);

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `external_link` varchar(1000) DEFAULT NULL,
  `video_questions` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `assignments` (`id`, `course_id`, `teacher_id`, `title`, `description`, `file_url`, `file_name`, `due_date`, `max_marks`, `status`, `assignment_type`, `academic_period`, `created_at`, `external_link`, `video_questions`) VALUES
(1, 2, 3, 'assigment', 'ok ', NULL, NULL, '2026-05-07 14:21:00', 100, 'published', 'Lab', '2026-2027', '2026-05-07 14:21:20', NULL, NULL),
(5, 9, 60, 'Css video', '', NULL, NULL, '2026-08-17 12:19:00', 100, 'published', 'Video Lecture', '2026-2027', '2026-08-16 12:19:41', 'https://youtu.be/HcOc7P5BMi4?si=aP1adhY2dggqDWYp', NULL),
(6, 9, 60, 'new video', '', NULL, NULL, '2026-08-17 14:05:00', 100, 'published', 'Video Lecture', '2026-2027', '2026-08-17 14:05:57', 'https://youtu.be/BLl32FvcdVM?si=LeO7OGRcSAHDOBJ8', NULL),
(7, 10, 61, 'english', '', NULL, NULL, '2026-08-29 12:00:00', 100, 'published', 'Video Lecture', '2026-2027', '2026-08-28 12:04:18', 'https://youtu.be/HcOc7P5BMi4?si=MVCKKrodKZ4NlYKi', '["What is your name","ewdwqdqwd","wdwqdwqdeqf","efeqfeqdeqf","fefefefqe"]');

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused','leave') DEFAULT 'present',
  `marked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `method` varchar(50) DEFAULT 'Manual',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_att` (`student_id`,`course_id`,`date`),
  KEY `course_id` (`course_id`),
  KEY `fk_attendance_class` (`class_id`),
  KEY `fk_attendance_teacher` (`teacher_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `attendance` (`id`, `class_id`, `course_id`, `teacher_id`, `student_id`, `date`, `status`, `marked_by`, `created_at`, `method`) VALUES
(2, 1, 2, 3, 104, '2026-05-12 19:00:00', 'absent', NULL, '2026-05-13 09:10:49', 'Manual'),
(3, 1, 2, 3, 104, '2026-05-11 19:00:00', 'late', NULL, '2026-05-13 09:11:21', 'Manual'),
(4, 1, 2, 3, 104, '2026-05-10 19:00:00', 'present', NULL, '2026-05-13 09:11:27', 'Manual'),
(5, 2, 3, 3, 104, '2026-05-12 19:00:00', 'absent', NULL, '2026-05-13 09:14:52', 'Manual'),
(6, 2, 3, 3, 104, '2026-05-10 19:00:00', 'present', NULL, '2026-05-13 09:14:58', 'Manual'),
(7, 2, 3, 3, 104, '2026-05-11 19:00:00', 'late', NULL, '2026-05-13 09:15:05', 'Manual'),
(8, 2, 3, 3, 104, '2026-05-09 19:00:00', 'present', NULL, '2026-05-13 09:15:14', 'Manual'),
(11, 2, 3, 3, 104, '2026-05-19 19:00:00', 'absent', NULL, '2026-05-20 18:09:51', 'Manual'),
(15, 3, 5, 3, 110, '2026-07-03 19:00:00', 'absent', NULL, '2026-07-04 10:09:06', 'Manual'),
(16, 3, 5, 3, 109, '2026-07-03 19:00:00', 'present', NULL, '2026-07-04 10:09:06', 'Manual'),
(17, 3, 5, 3, 104, '2026-07-03 19:00:00', 'leave', NULL, '2026-07-04 10:09:06', 'Manual'),
(18, 2, 3, 3, 110, '2026-07-03 19:00:00', 'leave', NULL, '2026-07-04 10:15:34', 'Manual'),
(19, 2, 3, 3, 109, '2026-07-03 19:00:00', 'absent', NULL, '2026-07-04 10:15:34', 'Manual'),
(20, 2, 3, 3, 104, '2026-07-03 19:00:00', 'present', NULL, '2026-07-04 10:15:34', 'Manual'),
(28, 8, 9, 60, 120, '2026-08-14 19:00:00', 'present', NULL, '2026-08-15 12:19:45', 'Manual'),
(29, 9, 10, 61, 121, '2026-08-27 19:00:00', 'present', NULL, '2026-08-28 12:41:14', 'Face AI');

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `log_type` enum('system','security','academic','finance') DEFAULT 'system',
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `bd_applicants`;
CREATE TABLE `bd_applicants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `subjects` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('applied','shortlisted','interviewed','hired','rejected') DEFAULT 'applied',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `bd_applicants_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `bd_job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bd_bulk_hires`;
CREATE TABLE `bd_bulk_hires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `batch_name` varchar(255) NOT NULL,
  `teacher_count` int(11) NOT NULL,
  `subject_areas` varchar(255) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `status` enum('planning','recruiting','onboarding','completed','cancelled') DEFAULT 'planning',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `bd_bulk_hires_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bd_bulk_hires` (`id`, `campus_id`, `batch_name`, `teacher_count`, `subject_areas`, `target_date`, `status`, `notes`, `created_at`) VALUES
(1, 1, 'A', 16, 'MAth', '2026-05-17 19:00:00', 'planning', NULL, '2026-05-18 15:00:57');

DROP TABLE IF EXISTS `bd_campus_leads`;
CREATE TABLE `bd_campus_leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `bd_campus_leads_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bd_campus_leads` (`id`, `institution_name`, `contact_person`, `contact_email`, `contact_phone`, `city`, `deal_value`, `status`, `notes`, `assigned_to`, `created_at`, `updated_at`) VALUES
(1, 'Lancers tech', 'Ali khan', 'alikhan@gmail.com', NULL, 'lahore', '-5.00', 'proposal', NULL, 111, '2026-05-18 14:55:22', '2026-05-18 14:55:22');

DROP TABLE IF EXISTS `bd_job_postings`;
CREATE TABLE `bd_job_postings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invite_token` (`invite_token`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `bd_job_postings_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bd_job_postings` (`id`, `title`, `subject`, `campus_id`, `slots_available`, `slots_filled`, `experience_required`, `salary_range`, `description`, `deadline`, `status`, `invite_token`, `created_at`) VALUES
(1, 'Teacher Job', 'Lahore', 1, 20, 0, NULL, NULL, NULL, NULL, 'open', 'a5058c246840250c641aa247da96ae8fe13a90c48ee0d4c5', '2026-05-18 14:56:28');

DROP TABLE IF EXISTS `book_issues`;
CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` enum('issued','returned','overdue') DEFAULT 'issued',
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `book_issues_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `book_issues_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `book_issues` (`id`, `book_id`, `user_id`, `issue_date`, `return_date`, `due_date`, `status`) VALUES
(1, 1, 101, '2026-05-16 19:00:00', NULL, '2026-05-26 19:00:00', 'issued'),
(2, 2, 102, '2026-05-04 19:00:00', NULL, '2026-05-14 19:00:00', 'overdue'),
(3, 3, 109, '2026-05-09 19:00:00', '2026-05-16 19:00:00', '2026-05-17 19:00:00', 'returned');

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `isbn` varchar(100) NOT NULL,
  `author` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 1,
  `available` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `books` (`id`, `title`, `isbn`, `author`, `category`, `stock`, `available`) VALUES
(1, 'Introduction to Algorithms', '978-0262033848', 'Thomas H. Cormen', 'CS / Engineering', 10, 8),
(2, 'Computer Networks', '978-0132126953', 'Andrew S. Tanenbaum', 'CS / Engineering', 6, 5),
(3, 'Database System Concepts', '978-0073523323', 'Abraham Silberschatz', 'CS / Engineering', 8, 7),
(4, 'Artificial Intelligence: A Modern Approach', '978-0136086208', 'Stuart Russell', 'CS / Engineering', 5, 2),
(5, 'Operating System Concepts', '978-1118063330', 'Abraham Silberschatz', 'CS / Engineering', 7, 7),
(6, 'Business Psychology and Organisational Behaviour', '978-1848721593', 'Eugene McKenna', 'Management', 12, 10),
(7, 'Principles of Marketing', '978-0134492513', 'Philip Kotler', 'Management', 9, 8),
(8, 'Advanced Engineering Mathematics', '978-0470458365', 'Erwin Kreyszig', 'Mathematics', 15, 14);

DROP TABLE IF EXISTS `campus_attendance`;
CREATE TABLE `campus_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily` (`student_id`,`date`),
  CONSTRAINT `campus_attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `campus_attendance` (`id`, `student_id`, `date`, `time`, `marked_at`) VALUES
(1, 112, '2026-07-05 19:00:00', '01:58:47', '2026-07-06 20:58:47'),
(2, 112, '2026-07-06 19:00:00', '15:19:31', '2026-07-07 10:19:31'),
(3, 115, '2026-07-06 19:00:00', '19:20:29', '2026-07-07 14:20:29'),
(4, 121, '2026-08-27 19:00:00', '17:41:14', '2026-08-28 12:41:14');

DROP TABLE IF EXISTS `campuses`;
CREATE TABLE `campuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `dept_code` varchar(10) DEFAULT NULL,
  `subscription_plan` enum('basic','standard','premium') DEFAULT 'basic',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_campus_client` (`client_id`),
  CONSTRAINT `fk_campus_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `campuses` (`id`, `name`, `location`, `dept_code`, `subscription_plan`, `is_active`, `created_at`, `updated_at`, `client_id`) VALUES
(1, 'Lancers Tech Main Campus', 'Corporate HQ', 'LTM', 'premium', 1, '2026-05-01 21:06:39', '2026-05-21 20:59:57', 4),
(9, 'Gulberg', 'Gulberg', NULL, 'basic', 1, '2026-05-16 14:12:34', '2026-05-21 20:59:57', 4),
(10, 'DHA', 'DHA', NULL, 'basic', 1, '2026-05-16 14:12:48', '2026-05-21 20:59:57', 4),
(11, 'Bahria Town', 'Bahria Town', NULL, 'basic', 1, '2026-05-16 14:13:00', '2026-05-21 20:59:57', 4),
(12, 'Johar Town', 'Johar Town', NULL, 'basic', 1, '2026-05-16 14:13:10', '2026-05-21 20:59:57', 4),
(15, 'Asia university', 'MM road', NULL, 'basic', 1, '2026-05-22 20:39:57', '2026-05-22 20:39:57', 7),
(16, 'Math', 'shalimar scheme', NULL, 'basic', 1, '2026-05-31 19:26:23', '2026-05-31 20:04:20', 8),
(17, 'Main Branch ', 'Salamatpura lahore', NULL, 'basic', 1, '2026-07-30 14:55:46', '2026-07-30 14:55:46', 9),
(20, 'Peak Solutions Main Campus', 'Gulberg, Lahore', NULL, 'basic', 1, '2026-08-20 09:58:48', '2026-08-20 10:07:19', 10);

DROP TABLE IF EXISTS `challans`;
CREATE TABLE `challans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('unpaid','paid') DEFAULT 'unpaid',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `challans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `chat_messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `read_at`, `is_edited`, `is_deleted`) VALUES
(1, 2, 3, 'HI Sir', '2026-05-06 12:39:16', NULL, 0, 0),
(2, 6, 2, 'HI Sir', '2026-05-15 11:18:51', '2026-07-02 15:49:11', 0, 0),
(3, 193, 194, 'hi', '2026-07-18 12:36:22', NULL, 0, 0),
(4, 191, 192, 'This message was deleted', '2026-07-20 12:05:04', NULL, 1, 1),
(5, 194, 191, 'This message was deleted', '2026-07-20 12:36:45', '2026-07-20 12:36:49', 1, 1),
(6, 212, 213, 'HI', '2026-08-03 13:36:04', '2026-08-03 13:59:04', 0, 0),
(7, 214, 211, 'Hi', '2026-08-06 08:34:16', '2026-08-16 12:21:45', 0, 0),
(8, 214, 212, 'Hi', '2026-08-06 08:34:47', NULL, 0, 0);

DROP TABLE IF EXISTS `class_courses`;
CREATE TABLE `class_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `class_courses_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_courses_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `section` varchar(50) DEFAULT 'A',
  `academic_year` varchar(20) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  KEY `campus_id` (`campus_id`),
  KEY `fk_class_teacher` (`teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `classes` (`id`, `name`, `section`, `academic_year`, `teacher_id`, `program_id`, `room_id`, `campus_id`, `created_at`) VALUES
(1, 'b11', 'a', '2024-2025', 3, NULL, NULL, 1, '2026-05-07 13:36:11'),
(2, 'bs it ', 'B', '2024-2025', 3, NULL, NULL, 1, '2026-05-08 13:31:45'),
(3, 'React', 'A', '2024-2025', 3, NULL, NULL, 1, '2026-05-20 18:15:40'),
(4, 'text class', 'A', '2024-2025', 3, NULL, NULL, 1, '2026-05-20 18:19:56'),
(5, 'React ', 'B', '2024-2025', 7, NULL, NULL, 15, '2026-05-23 12:23:43'),
(7, 'react ', 'B', '2025-2026', 8, NULL, NULL, 16, '2026-07-03 10:50:32'),
(8, 'Web develment', 'A', '2024-2025', 60, NULL, NULL, 17, '2026-07-31 13:06:22'),
(9, 'Class 10', '!A', '2024-2025', 61, NULL, NULL, 20, '2026-08-28 11:47:40');

DROP TABLE IF EXISTS `client_invoices`;
CREATE TABLE `client_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Paid','Pending','Overdue') DEFAULT 'Pending',
  `billing_month` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `client_invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `client_invoices` (`id`, `client_id`, `amount`, `status`, `billing_month`, `created_at`, `updated_at`) VALUES
(1, 4, '5000.00', 'Paid', '2026-07', '2026-05-21 22:20:17', '2026-05-21 22:20:23');

DROP TABLE IF EXISTS `course_final_grades`;
CREATE TABLE `course_final_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `semester_id` int(11) NOT NULL,
  `total_marks` decimal(5,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `letter_grade` varchar(5) DEFAULT NULL,
  `grade_points` decimal(3,2) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `midterm_marks` decimal(5,2) DEFAULT 0.00,
  `final_marks` decimal(5,2) DEFAULT 0.00,
  `assignment_marks` decimal(5,2) DEFAULT 0.00,
  `quiz_marks` decimal(5,2) DEFAULT 0.00,
  `lab_marks` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course_semester` (`student_id`,`course_id`,`semester_id`),
  KEY `course_id` (`course_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `course_final_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_final_grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_final_grades_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_final_grades` (`id`, `enrollment_id`, `student_id`, `course_id`, `section_id`, `semester_id`, `total_marks`, `percentage`, `letter_grade`, `grade_points`, `is_published`, `created_at`, `midterm_marks`, `final_marks`, `assignment_marks`, `quiz_marks`, `lab_marks`) VALUES
(1, 26, 117, 2, NULL, 1, '100.00', '85.00', 'A', '4.00', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00'),
(2, 27, 117, 3, NULL, 1, '100.00', '75.00', 'B+', '3.30', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00'),
(3, 28, 118, 2, NULL, 1, '100.00', '85.00', 'A', '4.00', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00'),
(4, 29, 118, 3, NULL, 1, '100.00', '75.00', 'B+', '3.30', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00'),
(5, 30, 119, 2, NULL, 1, '100.00', '85.00', 'A', '4.00', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00'),
(6, 31, 119, 3, NULL, 1, '100.00', '75.00', 'B+', '3.30', 1, '2026-07-14 15:47:58', '0.00', '0.00', '0.00', '0.00', '0.00');

DROP TABLE IF EXISTS `course_prerequisites`;
CREATE TABLE `course_prerequisites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `prerequisite_course_id` int(11) NOT NULL,
  `min_grade` varchar(5) DEFAULT 'D',
  `prerequisite_type` enum('hard','soft','co-requisite') DEFAULT 'hard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `prerequisite_course_id` (`prerequisite_course_id`),
  CONSTRAINT `course_prerequisites_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_prerequisites_ibfk_2` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `course_reports`;
CREATE TABLE `course_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `generated_by_role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `course_reports` (`id`, `course_id`, `course_title`, `class_name`, `campus_id`, `campus_name`, `teacher_id`, `teacher_name`, `total_students`, `avg_attendance`, `avg_marks`, `pass_count`, `fail_count`, `total_assignments`, `completed_at`, `generated_by`, `generated_by_role`) VALUES
(1, 2, 'business  managment ', 'b11', 1, 'Lancers Tech Main Campus', 3, 'Finance Manager', 1, '33.33', '100.00', 2, 0, 1, '2026-05-18 14:04:11', 'principal', 'principal');

DROP TABLE IF EXISTS `course_sections`;
CREATE TABLE `course_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `section_label` varchar(10) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `max_capacity` int(11) DEFAULT 30,
  `current_enrolled` int(11) DEFAULT 0,
  `waitlist_capacity` int(11) DEFAULT 10,
  `waitlist_count` int(11) DEFAULT 0,
  `status` enum('open','full','waitlist','closed','cancelled') DEFAULT 'open',
  `is_auto_created` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_section` (`course_id`,`semester_id`,`section_label`),
  KEY `semester_id` (`semester_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_sections_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_sections_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `course_sections_ibfk_4` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `course_type` enum('theory','lab','theory+lab','seminar','internship') DEFAULT 'theory',
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  KEY `campus_id` (`campus_id`),
  KEY `fk_course_teacher` (`teacher_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `courses` (`id`, `program_id`, `class_id`, `teacher_id`, `campus_id`, `title`, `code`, `description`, `credit_hours`, `status`, `created_by_admin`, `created_at`, `course_type`, `department_id`) VALUES
(2, NULL, 1, 3, 1, 'business  managment ', NULL, 'intro to business ', 3, 'completed', 1, '2026-05-07 13:42:11', 'theory', NULL),
(3, NULL, 2, 3, 1, 'math', NULL, 'math', 3, 'active', 1, '2026-05-08 13:32:04', 'theory', NULL),
(4, NULL, 2, 3, 1, 'math', NULL, 'math', 3, 'active', 1, '2026-05-20 17:57:54', 'theory', NULL),
(5, NULL, 3, 3, 1, 'node', NULL, 'node', 3, 'active', 1, '2026-05-20 18:16:18', 'theory', NULL),
(6, NULL, 5, 7, 15, 'mangodb', NULL, 'Mangodb', 3, 'active', 1, '2026-05-23 12:24:05', 'theory', NULL),
(8, NULL, 7, 8, 16, 'components', NULL, '', 3, 'active', 1, '2026-07-03 10:50:50', 'theory', NULL),
(9, NULL, 8, 60, 17, 'HTML', NULL, 'full stack', 3, 'active', 1, '2026-07-31 13:06:52', 'theory', NULL),
(10, NULL, 9, 61, 20, 'English ', NULL, 'English Coures ', 3, 'active', 1, '2026-08-28 11:48:01', 'theory', NULL);

DROP TABLE IF EXISTS `degree_plan_courses`;
CREATE TABLE `degree_plan_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `degree_plan_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `is_core` tinyint(1) DEFAULT 1,
  `is_optional` tinyint(1) DEFAULT 0,
  `category` enum('core','elective','general','lab','project','thesis') DEFAULT 'core',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `degree_plan_id` (`degree_plan_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `degree_plan_courses_ibfk_1` FOREIGN KEY (`degree_plan_id`) REFERENCES `degree_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `degree_plan_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `degree_plans`;
CREATE TABLE `degree_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `version` varchar(20) NOT NULL,
  `effective_from` year(4) DEFAULT NULL,
  `min_credit_hours` int(11) DEFAULT 130,
  `max_credit_hours` int(11) DEFAULT 140,
  `core_credit_hours` int(11) DEFAULT NULL,
  `elective_credit_hours` int(11) DEFAULT NULL,
  `general_education_hours` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `approved_by_hec` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `degree_plans_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `faculty_id` (`faculty_id`),
  KEY `campus_id` (`campus_id`),
  KEY `fk_dept_client` (`client_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dept_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `departments` (`id`, `faculty_id`, `campus_id`, `name`, `code`, `created_at`, `client_id`) VALUES
(4, NULL, 1, 'Computer Science', 'CS01', '2026-05-13 09:46:57', 4),
(5, NULL, 1, 'Business Administration', 'BA01', '2026-05-13 09:46:57', 4),
(6, NULL, 1, 'Electrical Engineering', 'EE01', '2026-05-13 09:46:57', 4);

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `employee_code` varchar(50) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `specialization` text DEFAULT NULL,
  `joining_date` date NOT NULL,
  `employment_type` enum('permanent','adjunct','visiting','contract') DEFAULT 'permanent',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  KEY `user_id` (`user_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `employees` (`id`, `user_id`, `department_id`, `employee_code`, `designation`, `specialization`, `joining_date`, `employment_type`, `created_at`) VALUES
(1, 2, NULL, 'HOD-001', 'Head of Department', NULL, '2026-04-30 19:00:00', 'permanent', '2026-05-01 21:06:39'),
(2, 3, NULL, 'FIN-001', 'Chief Accounts Officer', NULL, '2026-04-30 19:00:00', 'permanent', '2026-05-01 21:06:39'),
(3, 108, NULL, 'EMP-52455', 'Lecturer', NULL, '2026-05-05 19:00:00', 'permanent', '2026-05-06 12:57:32'),
(4, 169, NULL, 'EMP-35056', 'Lecturer', NULL, '2026-05-17 19:00:00', 'permanent', '2026-05-18 12:05:35'),
(5, 171, NULL, 'EMP-63780', 'Lecturer', NULL, '2026-05-17 19:00:00', 'permanent', '2026-05-18 12:06:03'),
(7, 184, NULL, 'EMP-53409', 'Lecturer', NULL, '2026-05-22 19:00:00', 'permanent', '2026-05-22 21:05:53'),
(8, 193, NULL, 'EMP-43737', 'Lecturer', NULL, '2026-05-31 19:00:00', 'permanent', '2026-05-31 20:00:43'),
(9, 5, NULL, 'EMP-5-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(10, 6, NULL, 'EMP-6-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(11, 7, NULL, 'EMP-7-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(12, 104, NULL, 'EMP-104-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(13, 105, NULL, 'EMP-105-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(14, 107, NULL, 'EMP-107-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(15, 111, NULL, 'EMP-111-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(16, 123, NULL, 'EMP-123-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(17, 124, NULL, 'EMP-124-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(18, 129, NULL, 'EMP-129-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(19, 130, NULL, 'EMP-130-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(20, 131, NULL, 'EMP-131-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(21, 132, NULL, 'EMP-132-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(22, 133, NULL, 'EMP-133-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(23, 135, NULL, 'EMP-135-AUTO', 'Finance Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(24, 136, NULL, 'EMP-136-AUTO', 'Finance Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(25, 137, NULL, 'EMP-137-AUTO', 'Finance Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(26, 138, NULL, 'EMP-138-AUTO', 'Finance Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(27, 139, NULL, 'EMP-139-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(28, 141, NULL, 'EMP-141-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(29, 142, NULL, 'EMP-142-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(30, 143, NULL, 'EMP-143-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(31, 144, NULL, 'EMP-144-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(32, 145, NULL, 'EMP-145-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(33, 146, NULL, 'EMP-146-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(34, 147, NULL, 'EMP-147-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(35, 148, NULL, 'EMP-148-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(36, 150, NULL, 'EMP-150-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(37, 151, NULL, 'EMP-151-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(38, 152, NULL, 'EMP-152-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(39, 153, NULL, 'EMP-153-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(40, 155, NULL, 'EMP-155-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(41, 156, NULL, 'EMP-156-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(42, 157, NULL, 'EMP-157-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(43, 158, NULL, 'EMP-158-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(44, 159, NULL, 'EMP-159-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(45, 160, NULL, 'EMP-160-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(46, 161, NULL, 'EMP-161-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(47, 162, NULL, 'EMP-162-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(48, 163, NULL, 'EMP-163-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(49, 164, NULL, 'EMP-164-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(50, 165, NULL, 'EMP-165-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(51, 166, NULL, 'EMP-166-AUTO', 'Head of Department', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(52, 167, NULL, 'EMP-167-AUTO', 'Head of Department', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(53, 168, NULL, 'EMP-168-AUTO', 'Head of Department', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(54, 183, NULL, 'EMP-183-AUTO', 'Head of Department', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(55, 188, NULL, 'EMP-188-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(56, 190, NULL, 'EMP-190-AUTO', 'Staff', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(57, 191, NULL, 'EMP-191-AUTO', 'Head of Department', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(58, 192, NULL, 'EMP-192-AUTO', 'HR Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(59, 195, NULL, 'EMP-195-AUTO', 'Finance Manager', NULL, '2026-06-01 19:00:00', 'permanent', '2026-06-02 15:20:18'),
(60, 212, NULL, 'EMP-09105', 'Lecturer', NULL, '2026-07-30 19:00:00', 'permanent', '2026-07-31 13:05:09'),
(61, 221, NULL, 'EMP-19955', 'Lecturer', NULL, '2026-08-19 19:00:00', 'permanent', '2026-08-20 11:13:39');

DROP TABLE IF EXISTS `enrollment_registrations`;
CREATE TABLE `enrollment_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrollment_type` enum('regular','repeat','improvement','audit','transfer') DEFAULT 'regular',
  `status` enum('enrolled','waitlisted','dropped','withdrawn','completed','failed') DEFAULT 'enrolled',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `dropped_at` timestamp NULL DEFAULT NULL,
  `withdrawal_reason` text DEFAULT NULL,
  `registered_by` int(11) DEFAULT NULL COMMENT 'student or admin user id',
  `challan_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_section_semester` (`student_id`,`section_id`,`semester_id`),
  KEY `section_id` (`section_id`),
  KEY `semester_id` (`semester_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollment_registrations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_registrations_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_registrations_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_registrations_ibfk_4` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `enrollment_rules`;
CREATE TABLE `enrollment_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `program_level` enum('Undergraduate','Postgraduate','PhD') NOT NULL DEFAULT 'Undergraduate',
  `semester_type` enum('regular','summer') NOT NULL DEFAULT 'regular',
  `min_credit_hours` int(11) DEFAULT 9,
  `max_credit_hours` int(11) DEFAULT 21,
  `max_credit_hours_good_standing` int(11) DEFAULT 24 COMMENT 'For CGPA >= 3.5',
  `min_cgpa_for_overload` decimal(3,2) DEFAULT 3.50,
  `probation_cgpa_threshold` decimal(3,2) DEFAULT 2.00,
  `dismissal_cgpa_threshold` decimal(3,2) DEFAULT 1.50,
  `summer_max_credit_hours` int(11) DEFAULT 9,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campus_level_type` (`campus_id`,`program_level`,`semester_type`),
  CONSTRAINT `enrollment_rules_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `enrollment_rules` (`id`, `campus_id`, `program_level`, `semester_type`, `min_credit_hours`, `max_credit_hours`, `max_credit_hours_good_standing`, `min_cgpa_for_overload`, `probation_cgpa_threshold`, `dismissal_cgpa_threshold`, `summer_max_credit_hours`, `effective_from`) VALUES
(1, 1, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(2, 9, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(3, 10, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(4, 11, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(5, 12, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(6, 15, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, '2026-06-20 19:00:00'),
(7, 16, 'Undergraduate', 'regular', 9, 21, 24, '3.50', '2.00', '1.50', 9, NULL),
(8, 1, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(9, 9, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(10, 10, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(11, 11, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(12, 12, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(13, 15, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(14, 16, 'Postgraduate', 'regular', 9, 18, 21, '3.50', '2.50', '2.00', 6, '2026-06-20 19:00:00'),
(15, 1, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(16, 9, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(17, 10, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(18, 11, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(19, 12, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(20, 15, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00'),
(21, 16, 'PhD', 'regular', 6, 12, 15, '3.70', '3.00', '2.50', 6, '2026-06-20 19:00:00');

DROP TABLE IF EXISTS `enrollment_waitlist`;
CREATE TABLE `enrollment_waitlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `waitlisted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT '48-hour acceptance window',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_waitlist` (`student_id`,`section_id`),
  KEY `section_id` (`section_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `enrollment_waitlist_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_waitlist_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_waitlist_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `status` enum('pending','approved','dropped','completed') DEFAULT 'pending',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`,`semester`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(23, 111, 6, 0, '', 'approved', '2026-05-23 13:11:03'),
(25, 110, 5, 0, '', 'approved', '2026-07-04 10:09:44'),
(32, 120, 9, 0, '2026', 'approved', '2026-07-31 21:15:24'),
(33, 121, 10, 0, '', 'approved', '2026-08-28 11:49:23');

DROP TABLE IF EXISTS `exam_malpractice_logs`;
CREATE TABLE `exam_malpractice_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `incident_description` text NOT NULL,
  `severity` enum('Low','Medium','High') DEFAULT 'Medium',
  `status` enum('Pending','Warning Issued','Resolved') DEFAULT 'Pending',
  `incident_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_malpractice_logs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_malpractice_logs_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `exam_results`;
CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `exam_results` (`id`, `exam_id`, `student_id`, `marks_obtained`, `grade`, `gpa`, `remarks`) VALUES
(1, 1, 101, '82.00', 'B', '3.28', 'Satisfactory'),
(2, 1, 102, '89.00', 'A', '3.56', 'Needs improvement'),
(3, 1, 104, '58.00', 'C', '2.32', 'Good effort'),
(4, 1, 105, '65.00', 'C', '2.60', 'Outstanding performance'),
(5, 1, 106, '72.00', 'B', '2.88', 'Satisfactory'),
(6, 1, 107, '79.00', 'B', '3.16', 'Needs improvement'),
(7, 1, 108, '86.00', 'A', '3.44', 'Excellent grasp of concepts'),
(8, 2, 101, '82.00', 'B', '3.28', 'Satisfactory'),
(9, 2, 102, '89.00', 'A', '3.56', 'Needs improvement'),
(10, 2, 104, '58.00', 'C', '2.32', 'Good effort'),
(11, 2, 105, '65.00', 'C', '2.60', 'Outstanding performance'),
(12, 2, 106, '72.00', 'B', '2.88', 'Satisfactory'),
(13, 2, 107, '79.00', 'B', '3.16', 'Needs improvement'),
(14, 2, 108, '86.00', 'A', '3.44', 'Excellent grasp of concepts');

DROP TABLE IF EXISTS `exam_rooms`;
CREATE TABLE `exam_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `used` int(11) DEFAULT 0,
  `type` varchar(50) DEFAULT 'Examination Hall',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `exam_rooms` (`id`, `name`, `capacity`, `used`, `type`, `created_at`) VALUES
(1, 'Main Hall A', 200, 184, 'Examination Hall', '2026-06-09 12:31:56'),
(2, 'Library Floor 2', 120, 0, 'Quiet Zone', '2026-06-09 12:31:56'),
(3, 'Lab 04', 60, 58, 'Computer Lab', '2026-06-09 12:31:56'),
(4, 'Room 302', 40, 38, 'Classroom', '2026-06-09 12:31:56');

DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `exam_date` date NOT NULL,
  `max_marks` int(11) NOT NULL DEFAULT 100,
  `room_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `exams` (`id`, `course_id`, `name`, `exam_date`, `max_marks`, `room_number`) VALUES
(1, 2, 'Midterm Examination', '2026-05-09 19:00:00', 100, 'Room 302'),
(2, 3, 'Final Examination', '2026-05-14 19:00:00', 100, 'Main Hall A'),
(3, 3, 'Math', '2026-05-21 19:00:00', 100, 'Section A');

DROP TABLE IF EXISTS `face_descriptors`;
CREATE TABLE `face_descriptors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `descriptor` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student` (`student_id`),
  CONSTRAINT `face_descriptors_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `face_descriptors` (`id`, `student_id`, `label`, `descriptor`, `created_at`) VALUES
(1, 112, 'khalid', '[-0.06531690806150436,0.10345295071601868,0.05879645049571991,-0.015556341968476772,-0.11044275015592575,-0.047507766634225845,-0.01741631142795086,0.0054014078341424465,0.08853185921907425,-0.02640635333955288,0.21566453576087952,-0.09584853053092957,-0.2952393591403961,-0.02205684222280979,0.026615174487233162,0.03159600496292114,-0.18832404911518097,-0.08578463643789291,-0.042085446417331696,-0.04901709407567978,0.07644011825323105,0.005594690330326557,-0.009083151817321777,0.11146625876426697,-0.19929172098636627,-0.29181739687919617,-0.0458335280418396,-0.09422684460878372,0.015408514998853207,-0.1756967008113861,0.028071146458387375,0.016760842874646187,-0.18301865458488464,-0.05183030664920807,0.010632406920194626,0.04474862292408943,-0.11779849231243134,-0.09635981917381287,0.22287866473197937,-0.033986896276474,-0.10722360759973526,-0.05345595255494118,0.04094202443957329,0.24852712452411652,0.17653994262218475,0.08903784304857254,-0.011872549541294575,-0.05712970346212387,0.12248220294713974,-0.3416610360145569,0.036118034273386,0.19536352157592773,0.09122654795646667,0.11293470859527588,0.0627230778336525,-0.16652657091617584,0.008214317262172699,0.1209133043885231,-0.18171930313110352,0.1113857850432396,0.004492958076298237,-0.05978500470519066,0.002270458498969674,-0.09733378142118454,0.22486528754234314,0.06867704540491104,-0.13803324103355408,-0.10277000069618225,0.10543691366910934,-0.2084362804889679,-0.112139992415905,0.17609670758247375,-0.03778962418437004,-0.2213655263185501,-0.24183952808380127,0.04872533306479454,0.3862064778804779,0.20257402956485748,-0.1874839961528778,-0.05896145477890968,-0.05580384284257889,-0.0527370311319828,0.06980334967374802,0.05510926991701126,-0.09632578492164612,-0.06238054111599922,-0.11440983414649963,0.0701039507985115,0.2112702578306198,-0.011933967471122742,-0.05904935672879219,0.21656614542007446,0.03597956523299217,0.10237549245357513,0.02867129258811474,-0.014827124774456024,-0.11114863306283951,0.012574284337460995,-0.10047895461320877,0.018183540552854538,0.08023835718631744,-0.047821495682001114,-0.004330773372203112,0.13116291165351868,-0.1004067212343216,0.16243712604045868,-0.008060921914875507,-0.0614982508122921,-0.02296268381178379,0.0015919927973300219,-0.17706571519374847,-0.0009734490304253995,0.15841178596019745,-0.3244130611419678,0.1949365884065628,0.1329881101846695,0.03972373157739639,0.11685002595186234,0.04962563514709473,0.04375885799527168,0.008156637661159039,-0.04948193579912186,-0.15219780802726746,-0.06796496361494064,0.07981398701667786,-0.03562423586845398,0.08046378195285797,-0.06262028962373734]', '2026-07-06 20:58:25'),
(3, 115, 'umer', '[-0.16000115871429443,0.014104826375842094,0.11055294424295425,-0.047763608396053314,-0.017949692904949188,-0.020249836146831512,-0.02431296929717064,-0.03350022807717323,0.1703367978334427,-0.06707630306482315,0.23699846863746643,-0.015985002741217613,-0.2187570333480835,-0.030322672799229622,0.08522240817546844,0.05953281745314598,-0.11943643540143967,-0.08192986249923706,-0.03837493434548378,-0.08143701404333115,0.039600979536771774,0.060418516397476196,0.04037715867161751,0.07456521689891815,-0.19241324067115784,-0.3643186688423157,-0.11225323379039764,-0.14710935950279236,0.00223277835175395,-0.04270648956298828,0.018968161195516586,0.05441714823246002,-0.10675463825464249,-0.0011794306337833405,0.005737043917179108,0.14607518911361694,-0.04084273427724838,-0.08254118263721466,0.21996484696865082,-0.03614197298884392,-0.11206512153148651,-0.08928903937339783,0.05436234548687935,0.2368583232164383,0.13613654673099518,0.004299072083085775,0.032868560403585434,-0.03090575709939003,0.04945583641529083,-0.2174730747938156,0.05351341515779495,0.12688671052455902,0.07424265891313553,0.12427423894405365,0.11323729157447815,-0.12380866706371307,0.07735458761453629,0.05548470839858055,-0.1646500676870346,0.039803482592105865,-0.00601790240034461,-0.07264556735754013,-0.0008979843114502728,0.009816329926252365,0.29428207874298096,0.12604555487632751,-0.12073764950037003,-0.10675277560949326,0.07295409590005875,-0.1413927525281906,-0.09793584793806076,0.11313886195421219,-0.15415547788143158,-0.14045944809913635,-0.2848079800605774,0.036704834550619125,0.33541011810302734,0.08246208727359772,-0.21462062001228333,0.03355472534894943,-0.09059382975101471,-0.049495961517095566,0.10027872771024704,0.06141044944524765,-0.10210438817739487,0.008072366937994957,-0.1320650577545166,0.05172819644212723,0.2116231620311737,0.009834468364715576,-0.03143410384654999,0.20295101404190063,0.03193577006459236,0.07142599672079086,0.08262783288955688,0.060560453683137894,-0.0716986432671547,-0.0439840666949749,-0.11824321001768112,-0.023150963708758354,0.14787669479846954,-0.010826808400452137,0.010538959875702858,0.10906550288200378,-0.21685975790023804,0.14448592066764832,0.022984767332673073,-0.05796221271157265,0.04731624573469162,0.006875327788293362,-0.1579495519399643,-0.03580739349126816,0.18362849950790405,-0.2553679049015045,0.120570108294487,0.11772382259368896,0.01611098274588585,0.15210039913654327,0.06165210157632828,0.05927674472332001,-0.08789634704589844,-0.008117152377963066,-0.1401958167552948,0.01573164574801922,0.0569864884018898,0.024151938036084175,0.054180510342121124,0.030241191387176514]', '2026-07-07 14:20:10'),
(4, 121, 'Student Peak Solution', '[-0.15920336544513702,0.07608303427696228,0.10013631731271744,-0.013987134210765362,-0.07394076883792877,-0.03231029585003853,-0.06719641387462616,-0.09909051656723022,0.1317203938961029,-0.05129711329936981,0.2695668637752533,-0.016805538907647133,-0.21279415488243103,-0.045602668076753616,0.02144237980246544,0.058437518775463104,-0.16349400579929352,-0.06491152942180634,-0.007272610440850258,-0.057997554540634155,0.05163152143359184,0.06180886924266815,0.061272189021110535,0.09388373792171478,-0.22108939290046692,-0.3585483133792877,-0.09766244888305664,-0.1380777508020401,-0.02235381118953228,-0.02655602991580963,-0.014330636709928513,0.07589087635278702,-0.15407031774520874,-0.03701631352305412,0.0014654998667538166,0.1399773210287094,-0.060851674526929855,-0.05674510449171066,0.2158467024564743,0.009309320710599422,-0.1045568436384201,-0.045378636568784714,0.04626617580652237,0.2838893532752991,0.1666204333305359,0.005312706809490919,0.040640734136104584,-0.06305627524852753,0.04337310045957565,-0.21559695899486542,0.05535605549812317,0.19746044278144836,0.0891851931810379,0.0937594398856163,0.09145890921354294,-0.0929495096206665,0.09260404855012894,0.06349097192287445,-0.1683257818222046,0.023834237828850746,0.051564887166023254,-0.044251929968595505,0.04571676254272461,0.0006378125981427729,0.2402941882610321,0.10622519999742508,-0.07464335858821869,-0.0682283341884613,0.0608079694211483,-0.1417732536792755,-0.1286037564277649,0.0880630612373352,-0.15078720450401306,-0.20336709916591644,-0.3190210163593292,0.03634602203965187,0.37650376558303833,0.15536510944366455,-0.20417389273643494,0.02932148426771164,-0.08885928988456726,-0.08450408279895782,0.13089236617088318,0.03412025049328804,-0.09859251976013184,-0.01856708899140358,-0.14240188896656036,0.08103936910629272,0.215211421251297,0.013834075070917606,-0.012389865703880787,0.23130406439304352,0.06251856684684753,0.008715099655091763,0.10784938186407089,0.048320893198251724,-0.08858785778284073,-0.0010219503892585635,-0.13221608102321625,-0.00507042882964015,0.0870882123708725,-0.04893283545970917,0.016495492309331894,0.10329563170671463,-0.25190499424934387,0.12651169300079346,0.026538290083408356,-0.09699521213769913,0.018753550946712494,-0.03346700221300125,-0.18157866597175598,-0.03194531425833702,0.18576252460479736,-0.2472771853208542,0.12764285504817963,0.12587767839431763,0.02273036725819111,0.17645560204982758,0.07927427440881729,0.05790151655673981,-0.10307926684617996,-0.034772150218486786,-0.10430089384317398,-0.029939867556095123,0.06659021228551865,0.003639297094196081,0.08546562492847443,0.018628962337970734]', '2026-08-28 12:40:47');

DROP TABLE IF EXISTS `faculties`;
CREATE TABLE `faculties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_faculty_client` (`client_id`),
  CONSTRAINT `fk_faculty_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `fee_invoices`;
CREATE TABLE `fee_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `due_date` date NOT NULL,
  `status` enum('unpaid','partially_paid','paid','cancelled') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fee_invoices_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `fee_payments`;
CREATE TABLE `fee_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(100) DEFAULT 'bank',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `fee_payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `lab_id` (`lab_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feedback_ibfk_3` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `feedback` (`id`, `student_id`, `course_id`, `lab_id`, `rating`, `comment`, `submitted_at`) VALUES
(1, 104, NULL, 1, 4, 'Good', '2026-05-07 14:50:18'),
(2, 104, NULL, 1, 4, 'good', '2026-05-08 13:33:28');

DROP TABLE IF EXISTS `finance_expenses`;
CREATE TABLE `finance_expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` enum('utilities','maintenance','supplies','events','salaries','other') DEFAULT 'other',
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `finance_expenses_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `finance_expenses` (`id`, `title`, `category`, `amount`, `expense_date`, `description`, `campus_id`, `added_by`, `created_at`) VALUES
(3, 'High-Speed Fiber Internet', 'utilities', '12000.00', '2026-05-11 19:00:00', 'Campus main line internet subscription', 1, 3, '2026-05-19 13:46:39'),
(4, 'Science Lab Glassware & Supplies', 'maintenance', '24500.00', '2026-05-13 19:00:00', 'Chemical reagents and lab upgrade glassware', 1, 3, '2026-05-19 13:46:39'),
(5, 'Maintenance', 'maintenance', '10000.00', NULL, 'maintance full', 16, 195, '2026-06-02 15:09:53');

DROP TABLE IF EXISTS `finance_fee_structures`;
CREATE TABLE `finance_fee_structures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `per_credit_hour_fee` decimal(10,2) DEFAULT 5000.00,
  `registration_fee` decimal(10,2) DEFAULT 2000.00,
  `exam_fee` decimal(10,2) DEFAULT 1000.00,
  `lab_fee_per_credit` decimal(10,2) DEFAULT 1500.00,
  `security_deposit` decimal(10,2) DEFAULT 0.00,
  `late_fee_per_day` decimal(10,2) DEFAULT 100.00,
  `effective_from` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `campus_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  KEY `semester_id` (`semester_id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `finance_fee_structures_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_fee_structures_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_fee_structures_ibfk_3` FOREIGN KEY (`campus_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `finance_payroll`;
CREATE TABLE `finance_payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `finance_payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `finance_payroll_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `finance_payroll` (`id`, `employee_id`, `month`, `year`, `basic_salary`, `bonus`, `deductions`, `net_payable`, `status`, `disbursed_at`, `campus_id`, `created_at`) VALUES
(2, 1, 'May', 2026, '120000.00', '10000.00', '5000.00', '125000.00', 'disbursed', '2026-05-01 05:00:00', 1, '2026-05-19 13:46:39'),
(3, 3, 'May', 2026, '80000.00', '5000.00', '3000.00', '82000.00', 'disbursed', '2026-05-01 06:30:00', 1, '2026-05-19 13:46:39'),
(4, 4, 'May', 2026, '75000.00', '0.00', '2000.00', '73000.00', 'disbursed', '2026-05-19 14:09:19', 1, '2026-05-19 13:46:39'),
(5, 8, 'June', 2024, '80.00', '20.00', '7.00', '93.00', 'disbursed', '2026-06-02 15:46:04', 16, '2026-06-02 15:28:46');

DROP TABLE IF EXISTS `finance_scholarship_types`;
CREATE TABLE `finance_scholarship_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_percentage` decimal(5,2) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `type` enum('merit','need_based','sports','other') DEFAULT 'merit',
  `fixed_amount` decimal(10,2) DEFAULT NULL,
  `min_cgpa_required` decimal(3,2) DEFAULT NULL,
  `max_family_income` decimal(12,2) DEFAULT NULL,
  `renewable` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `finance_scholarship_types_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `finance_student_challans`;
CREATE TABLE `finance_student_challans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('unpaid','paid','overdue','pending') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reminder_count` int(11) DEFAULT 0,
  `last_reminder_at` datetime DEFAULT NULL,
  `title` varchar(255) DEFAULT 'Tuition Fee',
  `campus_id` int(11) DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `challan_no` varchar(255) DEFAULT NULL,
  `tuition_fee` decimal(10,2) DEFAULT 0.00,
  `lab_fee` decimal(10,2) DEFAULT 0.00,
  `library_fee` decimal(10,2) DEFAULT 0.00,
  `other_fee` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `academic_year` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `fee_type` varchar(20) DEFAULT 'semester',
  `fee_month` int(11) DEFAULT NULL,
  `fee_year` int(11) DEFAULT NULL,
  `transport_fee` decimal(10,2) DEFAULT 0.00,
  `activity_fee` decimal(10,2) DEFAULT 0.00,
  `computer_fee` decimal(10,2) DEFAULT 0.00,
  `accrued_late_fee` decimal(10,2) DEFAULT 0.00,
  `late_fee_per_day` decimal(10,2) DEFAULT 100.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `finance_student_scholarships`;
CREATE TABLE `finance_student_scholarships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `status` enum('approved','pending','rejected','active','revoked','expired') DEFAULT 'pending',
  `campus_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `scholarship_id` int(11) NOT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `campus_id` (`campus_id`),
  KEY `fk_fss_scholarship` (`scholarship_id`),
  CONSTRAINT `finance_student_scholarships_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_student_scholarships_ibfk_3` FOREIGN KEY (`campus_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fss_scholarship` FOREIGN KEY (`scholarship_id`) REFERENCES `finance_scholarship_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `grade_policies`;
CREATE TABLE `grade_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `grade_letter` varchar(5) NOT NULL,
  `min_percentage` decimal(5,2) NOT NULL,
  `max_percentage` decimal(5,2) NOT NULL,
  `grade_points` decimal(3,2) NOT NULL,
  `is_passing` tinyint(1) DEFAULT 1,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `grade_policies_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grade_policies` (`id`, `campus_id`, `grade_letter`, `min_percentage`, `max_percentage`, `grade_points`, `is_passing`, `effective_from`) VALUES
(1, NULL, 'A+', '90.00', '100.00', '4.00', 1, NULL),
(2, NULL, 'A', '85.00', '89.99', '4.00', 1, NULL),
(3, NULL, 'A-', '80.00', '84.99', '3.70', 1, NULL),
(4, NULL, 'B+', '75.00', '79.99', '3.30', 1, NULL),
(5, NULL, 'B', '71.00', '74.99', '3.00', 1, NULL),
(6, NULL, 'B-', '68.00', '70.99', '2.70', 1, NULL),
(7, NULL, 'C+', '64.00', '67.99', '2.30', 1, NULL),
(8, NULL, 'C', '60.00', '63.99', '2.00', 1, NULL),
(9, NULL, 'C-', '57.00', '59.99', '1.70', 1, NULL),
(10, NULL, 'D+', '53.00', '56.99', '1.30', 1, NULL),
(11, NULL, 'D', '50.00', '52.99', '1.00', 1, NULL),
(12, NULL, 'F', '0.00', '49.99', '0.00', 0, NULL);

DROP TABLE IF EXISTS `grades`;
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `grades` (`id`, `student_id`, `course_id`, `teacher_id`, `exam_type`, `marks_obtained`, `max_marks`, `grade_letter`, `percentage`, `exam_date`, `remarks`, `created_at`) VALUES
(1, 104, 2, 3, 'quiz', '100.00', 100, 'A+', '100.00', '2026-05-06 19:00:00', '80', '2026-05-07 14:38:26'),
(2, 104, 2, 3, 'assignment', '100.00', 100, 'A+', '100.00', '2026-05-07 19:00:00', '40', '2026-05-08 13:23:01'),
(3, 111, 6, 7, 'midterm', '100.00', 100, 'A+', '100.00', '2026-05-22 19:00:00', '120', '2026-05-23 14:20:38');

DROP TABLE IF EXISTS `graduation_applications`;
CREATE TABLE `graduation_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `total_credits_earned` decimal(6,2) DEFAULT 0.00,
  `final_cgpa` decimal(4,3) DEFAULT 0.000,
  `status` enum('applied','under_review','approved','rejected','graduated') DEFAULT 'applied',
  `approved_by` int(11) DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `degree_issued_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `graduation_applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `graduation_applications_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `graduation_applications` (`id`, `student_id`, `semester_id`, `total_credits_earned`, `final_cgpa`, `status`, `approved_by`, `graduation_date`, `degree_issued_date`, `notes`, `created_at`) VALUES
(4, 112, 1, '0.00', '0.000', '', NULL, NULL, NULL, NULL, '2026-06-27 12:14:22');

DROP TABLE IF EXISTS `graduation_requirements`;
CREATE TABLE `graduation_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `degree_plan_id` int(11) NOT NULL,
  `requirement_type` enum('total_credits','cgpa','core_credits','elective_credits','thesis','fyp','internship') NOT NULL,
  `required_value` decimal(6,2) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `degree_plan_id` (`degree_plan_id`),
  CONSTRAINT `graduation_requirements_ibfk_1` FOREIGN KEY (`degree_plan_id`) REFERENCES `degree_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `hr_announcements`;
CREATE TABLE `hr_announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `msg` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `client_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `hr_announcements_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `hr_job_postings`;
CREATE TABLE `hr_job_postings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `status` enum('Active','Closed') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hr_job_postings` (`id`, `title`, `description`, `department`, `posted_by`, `status`, `created_at`, `client_id`) VALUES
(1, 'Teacher ', NULL, 'Lancer tech', NULL, 'Active', '2026-05-18 15:32:51', NULL),
(2, 'Teachers ', NULL, 'teacher need', NULL, 'Active', '2026-06-02 14:43:29', 8);

DROP TABLE IF EXISTS `hr_leave_requests`;
CREATE TABLE `hr_leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `hr_leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hr_leave_requests` (`id`, `user_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `created_at`) VALUES
(3, 2, 'Sick Leave', '2026-05-19 19:00:00', '2026-05-21 19:00:00', 'Suffering from severe flu and high temperature.', 'Rejected', '2026-05-18 15:48:51'),
(4, 3, 'Casual Leave', '2026-05-24 19:00:00', '2026-05-25 19:00:00', 'Family emergency event at home town.', 'Pending', '2026-05-18 15:48:51'),
(5, 108, 'Sick', '2026-05-17 19:00:00', '2026-05-21 19:00:00', 'sir tabiyat nahi thk ', 'Rejected', '2026-05-18 16:11:01'),
(6, 2, 'Maternity', '2026-05-17 19:00:00', '2026-05-19 19:00:00', 'Hyee allah', 'Approved', '2026-05-18 16:12:30'),
(7, 184, 'Sick', '2026-05-22 19:00:00', '2026-05-26 19:00:00', 'tirad', 'Pending', '2026-05-23 14:21:30'),
(8, 191, 'Short', '2026-06-01 19:00:00', '2026-06-09 19:00:00', 'Headache
', 'Rejected', '2026-06-02 14:37:38');

DROP TABLE IF EXISTS `institutional_kpis`;
CREATE TABLE `institutional_kpis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `metric_name` varchar(255) NOT NULL,
  `metric_value` decimal(15,2) DEFAULT 0.00,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `institutional_kpis_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `institutional_kpis` (`id`, `campus_id`, `metric_name`, `metric_value`, `recorded_at`) VALUES
(1, NULL, 'overall_gpa', '3.42', '2026-05-15 11:06:59'),
(2, NULL, 'retention_rate', '94.50', '2026-05-15 11:06:59'),
(3, NULL, 'research_grants', '1200000.00', '2026-05-15 11:06:59'),
(4, NULL, 'employment_rate', '88.00', '2026-05-15 11:06:59');

DROP TABLE IF EXISTS `it_audit_logs`;
CREATE TABLE `it_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `it_system_config`;
CREATE TABLE `it_system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `it_system_config` (`id`, `config_key`, `config_value`, `description`, `updated_at`) VALUES
(1, 'app_name', 'Lancers Tech LMS', 'Main application name', '2026-05-05 16:59:58'),
(2, 'smtp_host', 'smtp.lancerstech.com', 'SMTP Server Host', '2026-05-05 16:59:58'),
(3, 'maintenance_mode', 'false', 'Enable/Disable maintenance mode', '2026-05-05 16:59:58'),
(4, 'max_upload_size', '50MB', 'Maximum file upload size', '2026-05-05 16:59:58');

DROP TABLE IF EXISTS `it_tickets`;
CREATE TABLE `it_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `category` varchar(100) DEFAULT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lab_inventory`;
CREATE TABLE `lab_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `status` enum('Available','Low Stock','Maintenance','Depleted') DEFAULT 'Available',
  `last_restock` date DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `lab_inventory_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `lab_safety_logs`;
CREATE TABLE `lab_safety_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `incident_type` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `reported_by` int(11) NOT NULL,
  `status` enum('Resolved','Investigating','Reported') DEFAULT 'Reported',
  `client_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `lab_safety_logs_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_safety_logs_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `lab_schedules`;
CREATE TABLE `lab_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `instructor_name` varchar(255) NOT NULL,
  `experiment_title` varchar(255) NOT NULL,
  `schedule_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `client_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `lab_schedules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `lab_usage`;
CREATE TABLE `lab_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `lab_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `submission_code` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `lab_id` (`lab_id`),
  CONSTRAINT `lab_usage_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_usage_ibfk_2` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `labs`;
CREATE TABLE `labs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `hod_id` int(11) DEFAULT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `environment` varchar(255) DEFAULT 'Python',
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `labs_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `labs_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `labs` (`id`, `name`, `description`, `icon`, `url`, `class_id`, `hod_id`, `campus_id`, `environment`) VALUES
(1, 'Lab', 'lab', 'Code', 'https://onecompiler.com/embed/nodejs', 1, 2, 1, 'Node.js');

DROP TABLE IF EXISTS `lancers_clients`;
CREATE TABLE `lancers_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `allowed_modules` text DEFAULT NULL,
  `institution_type` enum('school','university') NOT NULL DEFAULT 'university',
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`),
  UNIQUE KEY `admin_email` (`admin_email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `lancers_clients` (`id`, `university_name`, `domain`, `admin_name`, `admin_email`, `package_type`, `subscription_status`, `monthly_fee`, `registered_at`, `logo_url`, `primary_color`, `allowed_modules`, `institution_type`) VALUES
(4, 'Lancers Nexus University', 'nexus.lancerstech.com', 'Lancers Nexus Root', 'nexus.admin@lancerstech.com', 'Enterprise', 'Active', '5000.00', '2026-05-21 13:57:59', NULL, NULL, '["rector","principals","bd","hr","finance","registrar","admissions","exams","library","it"]', 'university'),
(7, 'Asia', 'asiauniversity.com', 'Shahrukh farooq', 'shahrukhfarooq@gmail.com', 'Premium', 'Active', '200000.00', '2026-05-22 20:37:29', 'https://nsis.navttc.gov.pk/assets/images/logo/PMYP-LOGO-01.png', '#7f2dfb', '["rector","principals","bd","finance","admissions","library"]', 'university'),
(8, 'UET', 'URT,com', 'shaheryar', 'shaheryar@gmail.com', 'Premium', 'Active', '500000.00', '2026-05-25 22:03:30', 'https://pu.edu.pk/temp1/img/logo.png', 'var(--primary-color, #4f46e5)', '["rector","principals","hr","finance","library","it","registrar","exams","admissions","bd"]', 'university'),
(9, 'Al sufa school system', 'Alsuffasystem.com', 'Uneeb ali', 'uneebalikhan0@gmail.com', 'Enterprise', 'Active', '100000.00', '2026-07-30 14:25:17', 'https://static.vecteezy.com/system/resources/thumbnails/045/548/055/small/school-logo-design-template-vector.jpg', '#1a4adb', '["principals","hr","finance","admissions","exams","library","it","parent"]', 'school'),
(10, 'peaksolutions', 'peaksolutions.edu.pk', 'Ali ', 'ali@gmail.com', 'Premium', 'Active', '1000000.00', '2026-08-20 09:58:48', 'http://localhost:5000/api/uploads/logos/logo-1787220201275-204419656.png', '#643cc3', '["principals","hr","finance","admissions","it","parent"]', 'school');

DROP TABLE IF EXISTS `library_books`;
CREATE TABLE `library_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `rack_location` varchar(50) DEFAULT NULL,
  `status` enum('Available','Issued','Reserved','Maintenance') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `library_members`;
CREATE TABLE `library_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('Active','Suspended','Expired') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `library_members` (`id`, `name`, `email`, `role`, `department`, `status`, `created_at`) VALUES
(1, 'Emma Richardson', 'emma@student.com', 'student', 'Computer Science', 'Active', '2026-05-20 14:18:49'),
(2, 'James Chen', 'james@student.com', 'student', 'Software Engineering', 'Active', '2026-05-20 14:18:49'),
(3, 'Talha Khan', 'talha@gmail.com', 'student', 'Business Administration', 'Active', '2026-05-20 14:18:49'),
(4, 'Adeel Ahmad', 'adeel12@gmail.com', 'student', 'Electrical Engineering', 'Active', '2026-05-20 14:18:49'),
(5, 'Abid Ali', 'abid@gmail.com', 'student', 'Mathematics', 'Active', '2026-05-20 14:18:49');

DROP TABLE IF EXISTS `library_transactions`;
CREATE TABLE `library_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('Issued','Returned','Overdue') DEFAULT 'Issued',
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `library_transactions_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`),
  CONSTRAINT `library_transactions_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `library_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `library_transactions` (`id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`, `fine_amount`, `status`) VALUES
(1, 1, 1, '2026-05-15 19:00:00', '2026-05-25 19:00:00', NULL, '0.00', 'Issued'),
(2, 4, 2, '2026-04-29 19:00:00', '2026-05-13 19:00:00', NULL, '150.00', 'Overdue'),
(3, 3, 3, '2026-05-09 19:00:00', '2026-05-17 19:00:00', '2026-05-16 19:00:00', '0.00', 'Returned'),
(4, 6, 3, NULL, '2026-05-10 19:00:00', NULL, '0.00', 'Issued');

DROP TABLE IF EXISTS `marks`;
CREATE TABLE `marks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `marks_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `platform_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'maintenance_mode', 'false', 'Enable global maintenance mode for all tenants', '2026-07-27 09:40:10'),
(2, 'allow_new_registrations', 'true', 'Allow onboarding of new universities', '2026-06-01 16:28:58'),
(3, 'free_trial_days', '14', 'Default free trial days for new clients', '2026-05-21 22:24:31'),
(4, 'system_email', 'no-reply@lancerstech.com', 'Global sender email address', '2026-05-21 22:24:31');

DROP TABLE IF EXISTS `program_graduation_policies`;
CREATE TABLE `program_graduation_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `required_credits` decimal(6,2) DEFAULT 0.00,
  `minimum_cgpa` decimal(4,3) DEFAULT 0.000,
  `mandatory_courses` text DEFAULT NULL,
  `graduation_fee` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `program_graduation_policies_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT 'Undergraduate',
  `duration_years` decimal(3,1) DEFAULT 4.0,
  `accreditation_status` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `programs` (`id`, `department_id`, `name`, `code`, `level`, `duration_years`, `accreditation_status`, `created_at`) VALUES
(1, 4, 'BS Computer Science', 'BSCS', 'Undergraduate', '4.0', 'HEC Approved', '2026-05-04 12:43:28'),
(2, NULL, 'BBA Marketing', 'BBA-M', 'Undergraduate', '4.0', 'HEC Approved', '2026-05-04 12:43:28'),
(3, NULL, 'BS Software Engineering', 'BSSE', 'Undergraduate', '4.0', NULL, '2026-05-19 15:57:39');

DROP TABLE IF EXISTS `registrar_degree_verifications`;
CREATE TABLE `registrar_degree_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `degree_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `requester_email` varchar(100) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `status` enum('Pending','Verified','Rejected') DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `degree_id` (`degree_id`),
  CONSTRAINT `registrar_degree_verifications_ibfk_1` FOREIGN KEY (`degree_id`) REFERENCES `registrar_degrees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registrar_degree_verifications` (`id`, `degree_id`, `company_name`, `requester_email`, `request_date`, `status`) VALUES
(1, 1, 'Google Inc.', NULL, '2025-03-14 19:00:00', 'Verified'),
(2, 2, 'Goldman Sachs', NULL, '2025-03-13 19:00:00', 'Rejected');

DROP TABLE IF EXISTS `registrar_degrees`;
CREATE TABLE `registrar_degrees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `degree_title` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `serial_number` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Verified','Issued') DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `registrar_degrees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registrar_degrees` (`id`, `student_id`, `degree_title`, `issue_date`, `serial_number`, `status`) VALUES
(1, 102, 'BBA Marketing', '2025-01-09 19:00:00', 'LTS-D-2024-1289', 'Issued'),
(2, 101, 'BS Computer Science', '2026-01-14 19:00:00', 'LTS-D-2025-0932', 'Pending');

DROP TABLE IF EXISTS `registrar_transcript_requests`;
CREATE TABLE `registrar_transcript_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `request_date` date DEFAULT NULL,
  `status` enum('Pending','Processing','Completed','Rejected') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `registrar_transcript_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registrar_transcript_requests` (`id`, `student_id`, `request_date`, `status`, `notes`) VALUES
(1, 101, '2025-03-15 19:00:00', 'Pending', NULL),
(2, 102, '2025-03-11 19:00:00', 'Processing', NULL);

DROP TABLE IF EXISTS `research_projects`;
CREATE TABLE `research_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `lead_pi` varchar(255) DEFAULT NULL,
  `funding` decimal(15,2) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `research_projects` (`id`, `title`, `lead_pi`, `funding`, `duration`, `impact`) VALUES
(1, 'AI in Education Systems', 'Dr. Salman', '500000.00', '2 Years', 'High'),
(2, 'Quantum Computing Labs', 'Dr. Ahmed', '1200000.00', '3 Years', 'Global'),
(3, 'Sustainable Energy Grids', 'Prof. Raza', '750000.00', '1.5 Years', 'Medium');

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `building` varchar(100) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `room_type` enum('lecture','lab','seminar','auditorium','exam_hall') DEFAULT 'lecture',
  `capacity` int(11) DEFAULT 30,
  `is_air_conditioned` tinyint(1) DEFAULT 0,
  `has_projector` tinyint(1) DEFAULT 0,
  `has_smart_board` tinyint(1) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rooms` (`id`, `campus_id`, `building`, `room_number`, `room_type`, `capacity`, `is_air_conditioned`, `has_projector`, `has_smart_board`, `is_available`, `notes`, `created_at`) VALUES
(1, 16, 'Bs block', '83', 'lecture', 30, 1, 0, 0, 1, NULL, '2026-07-07 11:06:09'),
(2, 17, NULL, 'A', 'lecture', 30, 0, 0, 0, 1, NULL, '2026-08-16 14:45:41');

DROP TABLE IF EXISTS `scholarship_types`;
CREATE TABLE `scholarship_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('merit','need','sports','hafiz','hec','disability','sibling') NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `fixed_amount` decimal(12,2) DEFAULT NULL,
  `min_cgpa_required` decimal(3,2) DEFAULT NULL,
  `max_family_income` decimal(12,2) DEFAULT NULL,
  `renewable` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `scholarship_types_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `scholarship_types` (`id`, `campus_id`, `name`, `type`, `discount_percentage`, `fixed_amount`, `min_cgpa_required`, `max_family_income`, `renewable`, `is_active`, `created_at`) VALUES
(1, 20, 'Sibling Discount (2nd Child - 20%)', '', '20.00', NULL, NULL, NULL, 1, 1, '2026-08-20 12:53:55'),
(2, 20, 'Sibling Discount (3rd Child - 50%)', '', '50.00', NULL, NULL, NULL, 1, 1, '2026-08-20 12:53:55'),
(3, 20, 'Teacher / Staff Child (100% Tuition Waiver)', '', '100.00', NULL, NULL, NULL, 1, 1, '2026-08-20 12:53:55'),
(4, 20, 'Academic Position Holder / Merit (25% Concession)', 'merit', '25.00', NULL, NULL, NULL, 1, 1, '2026-08-20 12:53:55'),
(5, 20, 'Orphan / Special Financial Assistance (50%)', '', '50.00', NULL, NULL, NULL, 1, 1, '2026-08-20 12:53:55');

DROP TABLE IF EXISTS `school_fee_structures`;
CREATE TABLE `school_fee_structures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `tuition_fee` decimal(10,2) DEFAULT 0.00,
  `transport_fee` decimal(10,2) DEFAULT 0.00,
  `activity_fee` decimal(10,2) DEFAULT 0.00,
  `computer_fee` decimal(10,2) DEFAULT 0.00,
  `other_fee` decimal(10,2) DEFAULT 0.00,
  `late_fine_per_day` decimal(8,2) DEFAULT 50.00,
  `due_day` int(11) DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `school_fee_structures` (`id`, `campus_id`, `client_id`, `class_name`, `tuition_fee`, `transport_fee`, `activity_fee`, `computer_fee`, `other_fee`, `late_fine_per_day`, `due_day`, `created_at`, `updated_at`) VALUES
(1, 20, 10, 'Playgroup', '3500.00', '2000.00', '500.00', '0.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(2, 20, 10, 'Nursery', '4000.00', '2000.00', '500.00', '0.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(3, 20, 10, 'Prep', '4500.00', '2000.00', '500.00', '500.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(4, 20, 10, 'Class 1', '5000.00', '2500.00', '500.00', '500.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(5, 20, 10, 'Class 2', '5000.00', '2500.00', '500.00', '500.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(6, 20, 10, 'Class 3', '5500.00', '2500.00', '500.00', '500.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(7, 20, 10, 'Class 4', '5500.00', '2500.00', '500.00', '500.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(8, 20, 10, 'Class 5', '6000.00', '2500.00', '500.00', '800.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(9, 20, 10, 'Class 6', '6500.00', '3000.00', '800.00', '800.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(10, 20, 10, 'Class 7', '7000.00', '3000.00', '800.00', '800.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(11, 20, 10, 'Class 8', '7500.00', '3000.00', '800.00', '1000.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(12, 20, 10, 'Class 9', '8500.00', '3000.00', '1000.00', '1000.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(13, 20, 10, 'Class 10', '9000.00', '3000.00', '1000.00', '1000.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45'),
(14, 20, 10, 'O-Levels', '15000.00', '4000.00', '2000.00', '2000.00', '0.00', '50.00', 10, '2026-08-20 12:50:45', '2026-08-20 12:50:45');

DROP TABLE IF EXISTS `section_schedules`;
CREATE TABLE `section_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `schedule_type` enum('lecture','lab','tutorial') DEFAULT 'lecture',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section_time_slot` (`section_id`,`day_of_week`,`start_time`),
  UNIQUE KEY `unique_room_time_slot` (`room_id`,`day_of_week`,`start_time`,`semester_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `section_schedules_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `section_schedules_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `section_schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `term_type` enum('Fall','Spring','Summer') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `registration_open` datetime DEFAULT NULL,
  `registration_close` datetime DEFAULT NULL,
  `add_drop_deadline` datetime DEFAULT NULL,
  `withdrawal_deadline` datetime DEFAULT NULL,
  `midterm_start` date DEFAULT NULL,
  `midterm_end` date DEFAULT NULL,
  `final_start` date DEFAULT NULL,
  `final_end` date DEFAULT NULL,
  `result_publish_date` date DEFAULT NULL,
  `status` enum('upcoming','active','frozen','completed') DEFAULT 'upcoming',
  `is_summer` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `semesters` (`id`, `campus_id`, `name`, `term_type`, `start_date`, `end_date`, `registration_open`, `registration_close`, `add_drop_deadline`, `withdrawal_deadline`, `midterm_start`, `midterm_end`, `final_start`, `final_end`, `result_publish_date`, `status`, `is_summer`, `created_by`, `created_at`) VALUES
(1, 1, 'Spring 2026', 'Spring', '2025-12-31 19:00:00', '2026-05-31 19:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, NULL, '2026-06-27 12:13:28');

DROP TABLE IF EXISTS `staff_attendance`;
CREATE TABLE `staff_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Leave','Late') DEFAULT 'Present',
  `marked_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_attendance` (`user_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `staff_attendance` (`id`, `user_id`, `date`, `status`, `marked_by`, `created_at`) VALUES
(1, 214, '2026-08-15 19:00:00', 'Present', 211, '2026-08-16 14:45:06'),
(2, 215, '2026-08-15 19:00:00', 'Leave', 211, '2026-08-16 14:45:06'),
(3, 211, '2026-08-15 19:00:00', 'Present', 211, '2026-08-16 14:45:06'),
(4, 212, '2026-08-15 19:00:00', 'Absent', 211, '2026-08-16 14:45:06');

DROP TABLE IF EXISTS `student_classes`;
CREATE TABLE `student_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'approved',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_class` (`student_id`,`class_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(11, 110, 1, 'approved', '2026-05-20 18:28:52'),
(12, 110, 3, 'approved', '2026-05-20 18:28:54'),
(13, 111, 5, 'approved', '2026-05-23 12:25:30'),
(16, 120, 8, 'approved', '2026-07-31 21:15:20'),
(17, 121, 9, 'approved', '2026-08-28 11:49:09');

DROP TABLE IF EXISTS `student_parents`;
CREATE TABLE `student_parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_user_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship` varchar(50) DEFAULT 'Parent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_parent_student` (`parent_user_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_parents_ibfk_1` FOREIGN KEY (`parent_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_parents_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `student_parents` (`id`, `parent_user_id`, `student_id`, `relationship`, `created_at`) VALUES
(1, 206, 115, 'Parent', '2026-07-03 16:45:20');

DROP TABLE IF EXISTS `student_progress`;
CREATE TABLE `student_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `progress_percent` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `student_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `student_risk_assessments`;
CREATE TABLE `student_risk_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `risk_level` enum('low','medium','high','critical') DEFAULT 'low',
  `warning_score` decimal(5,2) DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `flagged_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_risk_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `student_scholarships`;
CREATE TABLE `student_scholarships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `scholarship_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `approved_amount` decimal(12,2) DEFAULT 0.00,
  `status` enum('pending','approved','rejected','expired') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `scholarship_id` (`scholarship_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `student_scholarships_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_scholarships_ibfk_2` FOREIGN KEY (`scholarship_id`) REFERENCES `scholarship_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_scholarships_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `student_semester_records`;
CREATE TABLE `student_semester_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `credits_attempted` decimal(5,2) DEFAULT 0.00,
  `credits_earned` decimal(5,2) DEFAULT 0.00,
  `semester_gpa` decimal(4,3) DEFAULT 0.000,
  `cumulative_gpa` decimal(4,3) DEFAULT 0.000,
  `academic_standing` enum('good','warning','probation','suspension','dismissed') DEFAULT 'good',
  `is_frozen` tinyint(1) DEFAULT 0,
  `freeze_reason` text DEFAULT NULL,
  `min_credit_hours_met` tinyint(1) DEFAULT 0,
  `max_credit_hours_ok` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_semester` (`student_id`,`semester_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `student_semester_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_semester_records_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `student_semester_records` (`id`, `student_id`, `semester_id`, `credits_attempted`, `credits_earned`, `semester_gpa`, `cumulative_gpa`, `academic_standing`, `is_frozen`, `freeze_reason`, `min_credit_hours_met`, `max_credit_hours_ok`, `created_at`) VALUES
(1, 117, 1, '6.00', '6.00', '3.650', '3.650', 'good', 0, NULL, 0, 1, '2026-07-14 15:47:58'),
(2, 118, 1, '6.00', '6.00', '3.650', '3.650', 'good', 0, NULL, 0, 1, '2026-07-14 15:47:58'),
(3, 119, 1, '6.00', '6.00', '3.650', '3.650', 'good', 0, NULL, 0, 1, '2026-07-14 15:47:58');

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `current_gpa` decimal(4,3) DEFAULT 0.000,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  KEY `user_id` (`user_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `students` (`id`, `user_id`, `program_id`, `roll_number`, `semester`, `admission_year`, `academic_status`, `cnic`, `father_name`, `father_cnic`, `father_number`, `bform_number`, `last_education`, `created_at`, `current_gpa`) VALUES
(101, 101, 1, 'STU-2024-001', 1, 2024, 'regular', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 12:43:28', '0.000'),
(102, 102, 2, 'STU-2024-002', 1, 2023, 'regular', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 12:43:28', '0.000'),
(104, 109, NULL, 'LTM-S4-26-001', 4, 2026, 'regular', NULL, 'ali', '984323456788', '0334656878', '234678997646', NULL, '2026-05-07 10:58:28', '0.000'),
(105, 173, NULL, 'LTM-S3-26-001', 3, 2026, 'regular', NULL, 'adeel', '93973682892', '032492891', '93872829929', NULL, '2026-05-18 12:07:47', '0.000'),
(106, 174, NULL, 'LTM-S5-26-001', 5, 2026, 'regular', NULL, 'abdullah', '034983742233', '03882999333 ', '98989809898', 'Matric', '2026-05-18 12:08:46', '0.000'),
(107, 175, NULL, 'LTM-S4-26-002', 4, 2026, 'regular', NULL, 'faheem', '2018232903892', '03291021092', '9283293829', NULL, '2026-05-18 12:09:39', '0.000'),
(108, 176, NULL, 'LTM-S3-26-002', 3, 2026, 'regular', NULL, 'naeem', '021843293', NULL, '203219382', NULL, '2026-05-18 13:21:02', '0.000'),
(109, 177, NULL, 'LTM-S1-26-001', 1, 2026, 'regular', NULL, 'shahrukh', '8372183728378', '03293898222', '237287382738832', NULL, '2026-05-20 18:22:55', '0.000'),
(110, 178, NULL, 'LTM-S1-26-002', 1, 2026, 'graduated', NULL, 'nouman', '323232323232445', '032223344', '4898493489374', NULL, '2026-05-20 18:27:57', '0.000'),
(111, 187, NULL, 'ASI-S4-26-001', 4, 2026, 'regular', NULL, 'jamil', '9132362362736', '038277628', '219273293872', NULL, '2026-05-23 12:24:54', '0.000'),
(112, 194, NULL, 'MAT-S4-26-001', 4, 2026, 'regular', NULL, 'khalid', '98736542727', '7961632176327', '7292372327777', NULL, '2026-05-31 20:01:51', '0.000'),
(114, 201, NULL, 'MAT-S5-26-002', 5, 2026, 'regular', NULL, 'ali khan', '098765432', '9876542345678', '234567890987654', NULL, '2026-06-30 19:50:30', '0.000'),
(115, 202, NULL, 'MAT-S5-26-001', 5, 2026, 'regular', NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-30 19:53:04', '0.000'),
(117, 207, 1, 'SP23-BSE-001', 6, 2023, 'regular', NULL, 'Father 1', NULL, NULL, NULL, NULL, '2026-07-14 15:47:58', '3.650'),
(118, 208, 1, 'SP23-BSE-002', 6, 2023, 'regular', NULL, 'Father 2', NULL, NULL, NULL, NULL, '2026-07-14 15:47:58', '3.650'),
(119, 209, 1, 'SP23-BSE-003', 6, 2023, 'regular', NULL, 'Father 3', NULL, NULL, NULL, NULL, '2026-07-14 15:47:58', '3.650'),
(120, 213, NULL, 'MAI-S1-26-001', 1, 2026, 'regular', NULL, 'abid', '57232362736273', '03262733765', '63791367267272', NULL, '2026-07-31 13:05:54', '0.000'),
(121, 222, NULL, 'PEA-S4-26-001', 4, 2026, 'regular', NULL, 'Student', '09876543222', '0324756389', '938748389938', NULL, '2026-08-20 11:17:09', '0.000'),
(122, 224, NULL, 'STU-TEST-9208', 1, 0, '', NULL, 'Ahmed Bilal', '35201-9988776-3', '0321-1234567', '35201-1122334-1', NULL, '2026-08-20 11:47:19', '0.000');

DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `watch_time_seconds` int(11) DEFAULT 0,
  `is_video_completed` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sub` (`assignment_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `submission_text`, `file_url`, `file_path`, `submitted_file_name`, `submitted_at`, `marks_obtained`, `feedback`, `graded_by`, `graded_at`, `updated_at`, `watch_time_seconds`, `is_video_completed`) VALUES
(2, 1, 104, 'ok sir', NULL, 'C:\\Users\\I.s computer\\Desktop\\All webiste\\Lancers tech Lms\\backend\\uploads\\submissions\\submission-1778165716765-273558633.png', 'linkedin.png', '2026-05-07 14:55:16', '62.00', 'Good ', 3, '2026-05-08 18:19:06', '2026-05-08 18:19:06', 0, 0),
(35, 5, 120, NULL, NULL, NULL, NULL, '2026-08-16 14:12:11', NULL, NULL, NULL, NULL, '2026-08-16 14:12:11', 880, 0),
(211, 6, 120, NULL, NULL, NULL, NULL, '2026-08-17 14:15:03', NULL, NULL, NULL, NULL, '2026-08-17 14:15:03', 30, 0),
(217, 7, 121, 'Q1: hufuehfue

Q2: efheufheuef

Q3: uheufheu

Q4: ufheufheu

Q5: efeuhe', NULL, NULL, NULL, '2026-08-28 13:51:10', '44.00', 'Good ', 61, '2026-08-28 13:47:13', '2026-08-28 13:51:10', 90, 1);

DROP TABLE IF EXISTS `teacher_availability`;
CREATE TABLE `teacher_availability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `available_from` time NOT NULL,
  `available_to` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_day_slot` (`teacher_id`,`semester_id`,`day_of_week`,`available_from`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `teacher_availability_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_availability_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `teacher_section_assignments`;
CREATE TABLE `teacher_section_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `role` enum('primary','co-instructor','lab_instructor') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'primary',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_section` (`teacher_id`,`section_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `teacher_section_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_section_assignments_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `teacher_workload_config`;
CREATE TABLE `teacher_workload_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `employment_type` enum('permanent','adjunct','visiting','contract') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'permanent',
  `max_credit_hours_per_semester` int(11) DEFAULT 12,
  `max_sections_per_course` int(11) DEFAULT 3,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campus_employment` (`campus_id`,`employment_type`),
  CONSTRAINT `teacher_workload_config_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `teacher_workload_config` (`id`, `campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`) VALUES
(1, 1, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(2, 9, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(3, 10, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(4, 11, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(5, 12, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(6, 15, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(7, 16, 'permanent', 12, 3, '2026-06-20 19:00:00'),
(8, 1, 'contract', 9, 2, '2026-06-20 19:00:00'),
(9, 9, 'contract', 9, 2, '2026-06-20 19:00:00'),
(10, 10, 'contract', 9, 2, '2026-06-20 19:00:00'),
(11, 11, 'contract', 9, 2, '2026-06-20 19:00:00'),
(12, 12, 'contract', 9, 2, '2026-06-20 19:00:00'),
(13, 15, 'contract', 9, 2, '2026-06-20 19:00:00'),
(14, 16, 'contract', 9, 2, '2026-06-20 19:00:00'),
(15, 1, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(16, 9, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(17, 10, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(18, 11, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(19, 12, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(20, 15, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(21, 16, 'visiting', 9, 2, '2026-06-20 19:00:00'),
(28, 1, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(29, 9, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(30, 10, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(31, 11, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(32, 12, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(33, 15, 'adjunct', 9, 2, '2026-06-21 19:00:00'),
(34, 16, 'adjunct', 9, 2, '2026-06-21 19:00:00');

DROP TABLE IF EXISTS `timetables`;
CREATE TABLE `timetables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `campus_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `semester` varchar(20) DEFAULT 'Fall',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_slot` (`teacher_id`,`day_of_week`,`start_time`,`academic_year`,`semester`),
  UNIQUE KEY `unique_room_slot` (`room_id`,`day_of_week`,`start_time`,`academic_year`,`semester`),
  KEY `class_id` (`class_id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `timetables_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timetables_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timetables_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timetables_ibfk_4` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `timetables` (`id`, `class_id`, `course_id`, `teacher_id`, `campus_id`, `day_of_week`, `start_time`, `end_time`, `room_id`, `academic_year`, `semester`) VALUES
(10, 1, 2, 3, 1, 'Monday', '09:00:00', '11:00:00', NULL, '2024-2025', 'Fall'),
(11, 1, 2, 3, 1, 'Tuesday', '09:00:00', '11:00:00', NULL, '2024-2025', 'Fall'),
(12, 2, 3, 3, 1, 'Wednesday', '09:02:00', '11:04:00', NULL, '2024-2025', 'Fall'),
(15, 8, 9, 60, 17, 'Monday', '09:00:00', '11:00:00', 2, '2024-2025', 'Fall'),
(16, 8, 9, 60, 17, 'Tuesday', '09:00:00', '11:00:00', 2, '2024-2025', 'Fall');

DROP TABLE IF EXISTS `trainings`;
CREATE TABLE `trainings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `campus_id` (`campus_id`),
  KEY `fk_user_client` (`client_id`),
  CONSTRAINT `fk_user_client` FOREIGN KEY (`client_id`) REFERENCES `lancers_clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(189, 'shaheryar', 'shaheryar@gmail.com', NULL, '$2b$10$NtUQtm8wvGefwv0MEKF0D.jFiqdWEnUufItzFao7bxO.vTfF/qiu.', 'super_admin', 'active', 0, 1, NULL, NULL, '2026-05-25 22:03:30', '2026-05-25 22:03:30', 8),
(190, 'junaid', 'junaid@gmail.com', NULL, '$2b$12$qjbZuUpid12YEDi0NZpCQ.SsO7abr.UopIhjpBMB/jMXY6AS9oMl.', 'rector', 'active', 1, 16, NULL, NULL, '2026-05-31 19:26:31', '2026-05-31 19:26:31', 8),
(191, 'Pola', 'pola@gmail.com', NULL, '$2b$12$30uE9GJisKyg4JeIGdJqteC5NKUM9aGj5KCb2c4yRCUvFEB6NvN66', 'principal', 'active', 1, 16, NULL, NULL, '2026-05-31 19:26:58', '2026-05-31 19:26:58', 8),
(192, 'Khazir ', 'khazir@gmail.com', NULL, '$2b$12$Eb7fI.cQ0RsnaLUl1PGTQOtS.qFStIqnlwkIMzcE7nq/iMQtDrQqO', 'hr_manager', 'active', 1, 16, NULL, NULL, '2026-05-31 19:27:34', '2026-05-31 19:27:34', 8),
(193, 'faizan', 'faizan@gmail.com', NULL, '$2b$12$uplXWCSkLvcmO.N17K8/Peu4yLuflOFolJXD.4EVSOtWIm4EiPrhS', 'teacher', 'active', 1, 16, NULL, NULL, '2026-05-31 20:00:43', '2026-05-31 20:00:43', 8),
(194, 'khalid', 'khalid@gmail.com', NULL, '$2b$12$m5v0lVFN3edy61M8hQIrs.uFBXL4RM9KiRilUKW2VWfbJ70c0EIP2', 'student', 'active', 1, 16, NULL, NULL, '2026-05-31 20:01:51', '2026-05-31 20:01:51', 8),
(195, 'hanzla', 'hanzla@gmail.com', NULL, '$2b$12$iDyLIneqv9FmXY9MIxNjUeIfvsGUGmINTzDff1NgS5BJbb/hIWe0O', 'finance_manager', 'active', 1, 16, NULL, NULL, '2026-06-02 14:50:50', '2026-06-02 14:50:50', 8),
(196, 'huzaifa', 'huzaifa@gmail.com', NULL, '$2b$12$OXDoioJgJn5Eibkae.dkdeJuRsuuAfjqmyubP7IJekcO19A.ISZ0q', 'registrar', 'active', 1, 16, NULL, NULL, '2026-06-02 16:23:22', '2026-06-02 16:23:22', 8),
(197, 'taimoor', 'taimoor@gmail.com', NULL, '$2b$12$J5HvRchUJj.v5lbOGjlqeuH2Eu8Aou5dUkpPecceTd3jAvGAJz.NG', 'admission_officer', 'active', 1, 16, NULL, NULL, '2026-06-02 19:46:32', '2026-07-18 12:32:55', 8),
(198, 'salman khan', 'salman@gmail.com', NULL, '$2b$12$nkaCpbdJCbaIhP7CrZJnBeL8XRBzwlEUBypk8rdKI1SGKZ97oUxU2', 'exam_controller', 'active', 1, 16, NULL, NULL, '2026-06-27 12:54:12', '2026-06-27 12:54:12', 8),
(199, 'abdullah', 'abdulhanan@gmail.com', NULL, '$2b$12$cL4YHKYKCw17Jj.jL3.AlOBC.kXqtFUkRlDV2WZtCpjmzrvPDLk9.', 'bd_agent', 'active', 1, 16, NULL, NULL, '2026-06-29 11:54:12', '2026-06-29 11:54:12', 8),
(201, 'umer', 'umer65438@gmail.com', NULL, '$2b$12$JyC0ZrBMGTHKYEsb1xDyVuBxbzw.8mrnod2w20IDbOsouwTiOnWYa', 'student', 'active', 1, 16, NULL, NULL, '2026-06-30 19:50:30', '2026-07-07 14:17:44', NULL),
(202, 'umer', 'umer098765432@gmail.com', NULL, '$2b$12$FA2b2s6nR6UJ9bJFSgIW1Ocp8GFcmp8hhOVL.Bq.vxg3Ty5W9Dg2e', 'student', 'active', 1, 16, NULL, NULL, '2026-06-30 19:53:04', '2026-06-30 20:04:59', NULL),
(204, 'usmanafzal', 'usmanafzal@gmail.com', NULL, '$2b$12$hNNgJkQrYevfwiniboCSxOzfrzqXbo5h2KdLJHVU1niMzRb0KVNly', 'librarian', 'active', 1, 16, NULL, NULL, '2026-07-03 14:31:38', '2026-07-03 14:31:38', 8),
(205, 'atif', 'atif09@gmail.com', NULL, '$2b$12$UWuVKzuUPOTCSvh53zR2LuQfPDLMCeDICiyajidZxyLxbS9l0EDRG', 'it_admin', 'active', 1, 16, NULL, NULL, '2026-07-03 14:32:01', '2026-07-03 14:32:01', 8),
(206, 'Ali khan', 'parents@gmail.com', NULL, '$2b$12$keKfzSmfSCCoRwUPb5Ba4.HzGoVpskhyC2bQTh64jHOqxK/o9qJ4W', 'parent', 'active', 1, 16, NULL, NULL, '2026-07-03 16:45:20', '2026-07-03 16:45:20', 8),
(207, 'Test Student 1', 'teststudent1_1784044078824@lancerstech.com', NULL, '$2b$10$DtbC7L98bbON4D2ptTnmrOrOa6s36dGGrTTz0ROaonWPobtjgPody', 'student', 'active', 1, 1, NULL, NULL, '2026-07-14 15:47:58', '2026-07-14 16:00:42', 8),
(208, 'Test Student 2', 'teststudent2_1784044078855@lancerstech.com', NULL, '$2b$10$DtbC7L98bbON4D2ptTnmrOrOa6s36dGGrTTz0ROaonWPobtjgPody', 'student', 'active', 1, 1, NULL, NULL, '2026-07-14 15:47:58', '2026-07-14 16:00:42', 8),
(209, 'Test Student 3', 'teststudent3_1784044078868@lancerstech.com', NULL, '$2b$10$DtbC7L98bbON4D2ptTnmrOrOa6s36dGGrTTz0ROaonWPobtjgPody', 'student', 'active', 1, 1, NULL, NULL, '2026-07-14 15:47:58', '2026-07-14 16:00:42', 8),
(210, 'Uneeb ali', 'uneebalikhan0@gmail.com', NULL, '$2b$10$mSoeG8RAfM7d.oC2At91nukYt0jihAE7EId3f/hq0cXz5Mj9Wj2tK', 'super_admin', 'active', 0, 1, NULL, NULL, '2026-07-30 14:25:17', '2026-07-30 14:25:17', 9),
(211, 'Abdullah ', 'principal@gmail.com', NULL, '$2b$12$EK7tzMkw2cHeAxV7F1H/B.pjzdtPRJP5VEGhVYKEpv4d3WZZOfjzK', 'principal', 'active', 1, 17, NULL, NULL, '2026-07-30 14:56:56', '2026-07-30 14:56:56', 9),
(212, 'Atif Ali', 'atifali@gmail.com', NULL, '$2b$12$wCP56kLa5GxMA6vqDjvFQeeTWaieGqnM54wtNPDb6e1hd4gzsxFPG', 'teacher', 'active', 1, 17, NULL, NULL, '2026-07-31 13:05:09', '2026-07-31 13:05:09', 9),
(213, 'hanan', 'hanan@gmail.com', NULL, '$2b$12$qU.5s1wKhzh030hoFNgeK.7fTPtOTZSXHCz3xaKRlHZ9Y/aW7IMsK', 'student', 'active', 1, 17, NULL, NULL, '2026-07-31 13:05:54', '2026-07-31 13:05:54', 9),
(214, 'mazhar', 'mazhar1@gmail.com', NULL, '$2b$12$X0QB7.Sa/UZSIG8ZD8NE1.zpp2JaauwETxDOfJDFEMHT/aRfSKR1S', 'finance_manager', 'active', 1, 17, NULL, NULL, '2026-08-06 08:33:15', '2026-08-06 08:33:15', 9),
(215, 'usman', 'usma1@gmail.com', NULL, '$2b$12$QyVV0bBbkyEntocS67A6D.IBk0BgnoLrXQNZy.WqlrlE5BBdxiBI2', 'hr_manager', 'active', 1, 17, NULL, NULL, '2026-08-06 08:36:23', '2026-08-06 08:36:23', 9),
(217, 'Rohan ', 'rohan09@gmail.com', NULL, '$2b$12$8dUzHMJs2J6cOBfH4kQlQ.n8N14zpqWQY1HlCzmfiqNTkvqMQ8GUO', 'admission_officer', 'active', 1, 17, NULL, NULL, '2026-08-19 15:02:27', '2026-08-19 15:02:27', 9),
(218, 'Ali ', 'ali@gmail.com', NULL, '$2b$10$U3032kD6UX5aVAGP/b9Jcui2j/GDxa14qVyq8BEMzLh7RTxXdwFKi', 'super_admin', 'active', 0, 20, NULL, NULL, '2026-08-20 09:58:49', '2026-08-20 09:58:49', 10),
(219, 'Mr idrees ', 'idress@gmail.com', NULL, '$2b$12$l0oi/GAS2PICuOHPl3NZXuMfP92P9OU5DsDWSkN1kT30.3WwIIe66', 'principal', 'active', 1, 20, NULL, NULL, '2026-08-20 10:13:44', '2026-08-20 13:34:09', 10),
(220, 'Admission Peak Solution', 'Admissionpeaksolution@gmail.com', NULL, '$2b$12$OHuUr0FOkDXRFN0zGWeKJeXSpN/I2X/39hugEB8chgqTEIMqjvYP.', 'admission_officer', 'active', 1, 20, NULL, NULL, '2026-08-20 11:12:34', '2026-08-20 11:12:34', 10),
(221, 'Teacher Peak Solution ', 'teacherpeaksolution@gmail.com', NULL, '$2b$12$ZIZx/8Z.WjdKloW1DpMesuz.WPm2ypAkjWGtqfAOJK4ZYvRtTO8QW', 'teacher', 'active', 1, 20, NULL, NULL, '2026-08-20 11:13:39', '2026-08-20 11:13:39', 10),
(222, 'Student Peak Solution', 'studentpeaksotion@gmail.com', NULL, '$2b$12$F6z7sAHriUICdId7RZrKjeW8uYebWir978/otX2tPLB16kFH.LrNi', 'student', 'active', 1, 20, NULL, NULL, '2026-08-20 11:17:09', '2026-08-20 11:17:09', 10),
(223, 'Finance Manager', 'financepeaksolution@gmail.com', NULL, '$2b$12$g6exSei6bAWpMpFjUxezAOafiwpuDMarPtPwDNomxZKeXxQ/.maKK', 'finance_manager', 'active', 1, 20, NULL, NULL, '2026-08-20 11:19:02', '2026-08-20 11:19:02', 10),
(224, 'Zubair Ahmed', 'zubair.1@school.edu', NULL, '$2b$10$5GpK4QZScj2vrXsHOAV7BezhXHsGIdvIxLCvxNeMxKFLOq.xpDZla', 'student', 'active', 1, 20, NULL, NULL, '2026-08-20 11:47:19', '2026-08-20 11:47:19', 10),
(225, 'HR manager ', 'hrmanagerpeaksolution@gmail.com', NULL, '$2b$12$sPKQXwObM282fQbE5nWWY.NXUWAxh2fYqWvrtVuV6JE98OLpc6B2m', 'hr_manager', 'active', 1, 20, NULL, NULL, '2026-08-20 14:58:23', '2026-08-20 14:58:23', 10),
(226, 'IT Admin', 'itadmin@gmail.com', NULL, '$2b$12$knzHflTwNACHwSB8cMQI2.zln7FJ4r1oRCrEp8UxzGTi3sBJMtJGe', 'it_admin', 'active', 1, 20, NULL, NULL, '2026-08-20 15:01:25', '2026-08-20 15:01:25', 10);

DROP TABLE IF EXISTS `vw_academic_standing`;
undefined;

INSERT INTO `vw_academic_standing` (`student_id`, `roll_number`, `student_name`, `program_name`, `program_level`, `current_semester`, `cgpa`, `academic_status`, `semester_gpa`, `credits_attempted`, `credits_earned`, `last_semester_name`) VALUES
(117, 'SP23-BSE-001', 'Test Student 1', 'BS Computer Science', 'Undergraduate', 6, '3.650', 'regular', '3.650', '6.00', '6.00', 'Spring 2026'),
(118, 'SP23-BSE-002', 'Test Student 2', 'BS Computer Science', 'Undergraduate', 6, '3.650', 'regular', '3.650', '6.00', '6.00', 'Spring 2026'),
(119, 'SP23-BSE-003', 'Test Student 3', 'BS Computer Science', 'Undergraduate', 6, '3.650', 'regular', '3.650', '6.00', '6.00', 'Spring 2026'),
(101, 'STU-2024-001', 'Emma Richardson', 'BS Computer Science', 'Undergraduate', 1, '0.000', 'regular', NULL, NULL, NULL, NULL),
(102, 'STU-2024-002', 'James Chen', 'BBA Marketing', 'Undergraduate', 1, '0.000', 'regular', NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `vw_attendance_eligibility`;
undefined;

INSERT INTO `vw_attendance_eligibility` (`student_id`, `course_id`, `roll_number`, `student_name`, `course_title`, `course_code`, `total_classes`, `attended`, `attendance_pct`, `exam_status`) VALUES
(104, 2, 'LTM-S4-26-001', 'talha', 'business  managment ', NULL, 3, '1.5', '50.00', 'INELIGIBLE'),
(104, 3, 'LTM-S4-26-001', 'talha', 'math', NULL, 6, '3.5', '58.33', 'INELIGIBLE'),
(104, 5, 'LTM-S4-26-001', 'talha', 'node', NULL, 1, '0.0', '0.00', 'INELIGIBLE'),
(109, 3, 'LTM-S1-26-001', 'sara', 'math', NULL, 1, '0.0', '0.00', 'INELIGIBLE'),
(109, 5, 'LTM-S1-26-001', 'sara', 'node', NULL, 1, '1.0', '100.00', 'ELIGIBLE'),
(110, 3, 'LTM-S1-26-002', 'rehantariq', 'math', NULL, 1, '0.0', '0.00', 'INELIGIBLE'),
(110, 5, 'LTM-S1-26-002', 'rehantariq', 'node', NULL, 1, '0.0', '0.00', 'INELIGIBLE'),
(120, 9, 'MAI-S1-26-001', 'hanan', 'HTML', NULL, 1, '1.0', '100.00', 'ELIGIBLE'),
(121, 10, 'PEA-S4-26-001', 'Student Peak Solution', 'English ', NULL, 1, '1.0', '100.00', 'ELIGIBLE');

DROP TABLE IF EXISTS `vw_section_occupancy`;
undefined;

DROP TABLE IF EXISTS `vw_student_transcript`;
undefined;

INSERT INTO `vw_student_transcript` (`student_id`, `roll_number`, `student_name`, `father_name`, `cnic`, `bform_number`, `program_name`, `program_code`, `course_title`, `course_code`, `credit_hours`, `enrollment_semester`, `marks_obtained`, `grade`, `gpa`) VALUES
(101, 'STU-2024-001', 'Emma Richardson', NULL, NULL, NULL, 'BS Computer Science', 'BSCS', 'business  managment ', NULL, 3, 1, NULL, NULL, NULL),
(101, 'STU-2024-001', 'Emma Richardson', NULL, NULL, NULL, 'BS Computer Science', 'BSCS', 'math', NULL, 3, 1, NULL, NULL, NULL),
(102, 'STU-2024-002', 'James Chen', NULL, NULL, NULL, 'BBA Marketing', 'BBA-M', 'business  managment ', NULL, 3, 1, NULL, NULL, NULL),
(102, 'STU-2024-002', 'James Chen', NULL, NULL, NULL, 'BBA Marketing', 'BBA-M', 'math', NULL, 3, 1, NULL, NULL, NULL);

DROP TABLE IF EXISTS `vw_teacher_workload`;
undefined;

INSERT INTO `vw_teacher_workload` (`teacher_id`, `teacher_name`, `email`, `employment_type`, `semester_id`, `semester_name`, `sections_assigned`, `total_credit_hours`, `max_allowed`) VALUES
(3, 'umer', 'umer@gmail.com', 'permanent', NULL, NULL, 0, '0', 12),
(4, 'Adeel ', 'adeel@gmail.com', 'permanent', NULL, NULL, 0, '0', 12),
(5, 'Azam', 'azam@gmail.com', 'permanent', NULL, NULL, 0, '0', 12),
(7, 'khan', 'khan@gmail.com', 'permanent', NULL, NULL, 0, '0', 12),
(8, 'faizan', 'faizan@gmail.com', 'permanent', NULL, NULL, 0, '0', 12),
(60, 'Atif Ali', 'atifali@gmail.com', 'permanent', NULL, NULL, 0, '0', NULL),
(61, 'Teacher Peak Solution ', 'teacherpeaksolution@gmail.com', 'permanent', NULL, NULL, 0, '0', NULL);

SET FOREIGN_KEY_CHECKS = 1;
