-- ============================================================
-- FIX SCRIPT: Add missing columns + corrected views
-- Run this in phpMyAdmin or via command line
-- ============================================================

-- 1. Add missing columns to existing tables
ALTER TABLE `courses`
  ADD COLUMN IF NOT EXISTS `course_type` enum('theory','lab','theory+lab','seminar','internship') DEFAULT 'theory',
  ADD COLUMN IF NOT EXISTS `department_id` int(11) DEFAULT NULL;

ALTER TABLE `students`
  ADD COLUMN IF NOT EXISTS `current_gpa` decimal(4,3) DEFAULT 0.000;

ALTER TABLE `employees`
  MODIFY COLUMN `employment_type` enum('permanent','adjunct','visiting','contract') DEFAULT 'permanent';

-- Fix teacher_workload_config employment_type to match employees table
ALTER TABLE `teacher_workload_config`
  MODIFY COLUMN `employment_type` enum('permanent','adjunct','visiting','contract') NOT NULL;

-- Re-seed workload config with correct enum values
INSERT IGNORE INTO `teacher_workload_config`
  (`campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`)
SELECT id, 'adjunct', 9, 2, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE max_credit_hours_per_semester = max_credit_hours_per_semester;

-- ============================================================
-- 2. Create all new Phase 2-5 tables (safe with IF NOT EXISTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS `teacher_section_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `role` enum('primary','co-instructor','lab_instructor') DEFAULT 'primary',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_section` (`teacher_id`, `section_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `course_sections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teacher_availability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `available_from` time NOT NULL,
  `available_to` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_day_slot` (`teacher_id`, `semester_id`, `day_of_week`, `available_from`),
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teacher_workload_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `employment_type` enum('permanent','adjunct','visiting','contract') NOT NULL,
  `max_credit_hours_per_semester` int(11) DEFAULT 12,
  `max_sections_per_course` int(11) DEFAULT 3,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campus_employment` (`campus_id`, `employment_type`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `teacher_workload_config`
  (`campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`)
SELECT id, 'permanent', 12, 3, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE max_credit_hours_per_semester = max_credit_hours_per_semester;

INSERT IGNORE INTO `teacher_workload_config`
  (`campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`)
SELECT id, 'contract', 9, 2, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE max_credit_hours_per_semester = max_credit_hours_per_semester;

INSERT IGNORE INTO `teacher_workload_config`
  (`campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`)
SELECT id, 'visiting', 9, 2, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE max_credit_hours_per_semester = max_credit_hours_per_semester;

INSERT IGNORE INTO `teacher_workload_config`
  (`campus_id`, `employment_type`, `max_credit_hours_per_semester`, `max_sections_per_course`, `effective_from`)
SELECT id, 'adjunct', 9, 2, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE max_credit_hours_per_semester = max_credit_hours_per_semester;

CREATE TABLE IF NOT EXISTS `enrollment_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `program_level` enum('Undergraduate','Postgraduate','PhD') NOT NULL DEFAULT 'Undergraduate',
  `semester_type` enum('regular','summer') NOT NULL DEFAULT 'regular',
  `min_credit_hours` int(11) DEFAULT 9,
  `max_credit_hours` int(11) DEFAULT 21,
  `max_credit_hours_good_standing` int(11) DEFAULT 24,
  `min_cgpa_for_overload` decimal(3,2) DEFAULT 3.50,
  `probation_cgpa_threshold` decimal(3,2) DEFAULT 2.00,
  `dismissal_cgpa_threshold` decimal(3,2) DEFAULT 1.50,
  `summer_max_credit_hours` int(11) DEFAULT 9,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campus_level_type` (`campus_id`, `program_level`, `semester_type`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `enrollment_rules`
  (`campus_id`, `program_level`, `semester_type`, `min_credit_hours`, `max_credit_hours`,
   `max_credit_hours_good_standing`, `min_cgpa_for_overload`, `probation_cgpa_threshold`,
   `dismissal_cgpa_threshold`, `summer_max_credit_hours`, `effective_from`)
SELECT id, 'Undergraduate', 'regular', 9, 21, 24, 3.50, 2.00, 1.50, 9, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE campus_id = campus_id;

INSERT IGNORE INTO `enrollment_rules`
  (`campus_id`, `program_level`, `semester_type`, `min_credit_hours`, `max_credit_hours`,
   `max_credit_hours_good_standing`, `min_cgpa_for_overload`, `probation_cgpa_threshold`,
   `dismissal_cgpa_threshold`, `summer_max_credit_hours`, `effective_from`)
SELECT id, 'Postgraduate', 'regular', 9, 18, 21, 3.50, 2.50, 2.00, 6, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE campus_id = campus_id;

INSERT IGNORE INTO `enrollment_rules`
  (`campus_id`, `program_level`, `semester_type`, `min_credit_hours`, `max_credit_hours`,
   `max_credit_hours_good_standing`, `min_cgpa_for_overload`, `probation_cgpa_threshold`,
   `dismissal_cgpa_threshold`, `summer_max_credit_hours`, `effective_from`)
SELECT id, 'PhD', 'regular', 6, 12, 15, 3.70, 3.00, 2.50, 6, CURDATE() FROM campuses
ON DUPLICATE KEY UPDATE campus_id = campus_id;

CREATE TABLE IF NOT EXISTS `enrollment_registrations` (
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
  `registered_by` int(11) DEFAULT NULL,
  `challan_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_section_semester` (`student_id`, `section_id`, `semester_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `course_sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `enrollment_waitlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `waitlisted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_waitlist` (`student_id`, `section_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `course_sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `graduation_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `degree_plan_id` int(11) NOT NULL,
  `requirement_type` enum('total_credits','cgpa','core_credits','elective_credits','thesis','fyp','internship') NOT NULL,
  `required_value` decimal(6,2) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`degree_plan_id`) REFERENCES `degree_plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `graduation_applications` (
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
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fee_structures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `per_credit_hour_fee` decimal(10,2) DEFAULT 5000.00,
  `registration_fee` decimal(10,2) DEFAULT 2000.00,
  `exam_fee` decimal(10,2) DEFAULT 1000.00,
  `lab_fee_per_credit` decimal(10,2) DEFAULT 1500.00,
  `security_deposit` decimal(10,2) DEFAULT 0.00,
  `late_fee_per_day` decimal(8,2) DEFAULT 100.00,
  `effective_from` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scholarship_types` (
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
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_scholarships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `scholarship_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `approved_amount` decimal(12,2) DEFAULT 0.00,
  `status` enum('pending','approved','rejected','expired') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`scholarship_id`) REFERENCES `scholarship_types`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Triggers
-- ============================================================

DROP TRIGGER IF EXISTS trg_update_section_enrolled_insert;
DROP TRIGGER IF EXISTS trg_update_section_enrolled_update;
DROP TRIGGER IF EXISTS trg_block_future_attendance;

-- ============================================================
-- 4. Reporting Views (collation-safe)
-- ============================================================

CREATE OR REPLACE VIEW vw_attendance_eligibility AS
  SELECT
    a.student_id,
    a.course_id,
    s.roll_number,
    u.name AS student_name,
    c.title AS course_title,
    c.code AS course_code,
    COUNT(*) AS total_classes,
    SUM(CASE WHEN a.status = 'present' THEN 1 WHEN a.status = 'late' THEN 0.5 ELSE 0 END) AS attended,
    ROUND(
      SUM(CASE WHEN a.status = 'present' THEN 1 WHEN a.status = 'late' THEN 0.5 ELSE 0 END)
      / COUNT(*) * 100, 2
    ) AS attendance_pct,
    CASE
      WHEN SUM(CASE WHEN a.status = 'present' THEN 1 WHEN a.status = 'late' THEN 0.5 ELSE 0 END)
           / COUNT(*) * 100 >= 75
      THEN 'ELIGIBLE'
      ELSE 'INELIGIBLE'
    END AS exam_status
  FROM attendance a
  JOIN students s ON a.student_id = s.id
  JOIN users u ON s.user_id = u.id
  JOIN courses c ON a.course_id = c.id
  GROUP BY a.student_id, a.course_id, s.roll_number, u.name, c.title, c.code;

CREATE OR REPLACE VIEW vw_section_occupancy AS
  SELECT
    cs.id,
    c.title AS course_title,
    c.code AS course_code,
    sem.name AS semester_name,
    cs.section_label,
    cs.max_capacity,
    cs.current_enrolled,
    cs.waitlist_count,
    cs.status,
    ROUND(cs.current_enrolled / cs.max_capacity * 100, 1) AS fill_pct,
    u.name AS teacher_name
  FROM course_sections cs
  JOIN courses c ON c.id = cs.course_id
  JOIN semesters sem ON sem.id = cs.semester_id
  LEFT JOIN employees e ON e.id = cs.teacher_id
  LEFT JOIN users u ON u.id = e.user_id;

CREATE OR REPLACE VIEW vw_teacher_workload AS
  SELECT
    e.id AS teacher_id,
    u.name AS teacher_name,
    u.email,
    e.employment_type,
    sem.id AS semester_id,
    sem.name AS semester_name,
    COUNT(DISTINCT tsa.section_id) AS sections_assigned,
    IFNULL(SUM(c.credit_hours), 0) AS total_credit_hours,
    twc.max_credit_hours_per_semester AS max_allowed
  FROM employees e
  JOIN users u ON u.id = e.user_id
  LEFT JOIN teacher_section_assignments tsa ON tsa.teacher_id = e.id
  LEFT JOIN course_sections cs ON cs.id = tsa.section_id
  LEFT JOIN courses c ON c.id = cs.course_id
  LEFT JOIN semesters sem ON sem.id = cs.semester_id
  LEFT JOIN teacher_workload_config twc
    ON twc.campus_id = u.campus_id
    AND twc.employment_type = e.employment_type
  WHERE CONVERT(u.role USING utf8mb4) COLLATE utf8mb4_general_ci = 'teacher'
  GROUP BY e.id, u.name, u.email, e.employment_type, sem.id, sem.name, twc.max_credit_hours_per_semester;

CREATE OR REPLACE VIEW vw_academic_standing AS
  SELECT
    s.id AS student_id,
    s.roll_number,
    u.name AS student_name,
    p.name AS program_name,
    p.level AS program_level,
    s.semester AS current_semester,
    s.current_gpa AS cgpa,
    s.academic_status,
    ssr.semester_gpa,
    ssr.credits_attempted,
    ssr.credits_earned,
    sem.name AS last_semester_name
  FROM students s
  JOIN users u ON u.id = s.user_id
  JOIN programs p ON p.id = s.program_id
  LEFT JOIN student_semester_records ssr ON ssr.student_id = s.id
  LEFT JOIN semesters sem ON sem.id = ssr.semester_id
  WHERE ssr.id IS NULL
     OR ssr.id = (
       SELECT id FROM student_semester_records
       WHERE student_id = s.id
       ORDER BY created_at DESC LIMIT 1
     );

CREATE OR REPLACE VIEW vw_student_transcript AS
  SELECT
    s.roll_number,
    u.name AS student_name,
    p.name AS program_name,
    c.code AS course_code,
    c.title AS course_title,
    c.credit_hours,
    IFNULL(c.course_type, 'theory') AS course_type,
    cfg.letter_grade,
    cfg.grade_points,
    cfg.percentage,
    cfg.is_published,
    sem.name AS semester_name,
    sem.term_type,
    sem.start_date AS semester_start
  FROM course_final_grades cfg
  JOIN students s ON s.id = cfg.student_id
  JOIN users u ON u.id = s.user_id
  JOIN programs p ON p.id = s.program_id
  JOIN courses c ON c.id = cfg.course_id
  JOIN semesters sem ON sem.id = cfg.semester_id
  WHERE cfg.is_published = 1;

SELECT 'Phase 2-5 Schema applied successfully!' AS Result;
