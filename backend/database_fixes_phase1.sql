-- Phase 1 Foundation Fixes

-- 1. Create missing foundational tables needed for FKs
CREATE TABLE IF NOT EXISTS `rooms` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `semesters` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. FK constraints on courses and classes
UPDATE courses SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM employees);
ALTER TABLE courses ADD CONSTRAINT fk_course_teacher FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE SET NULL;

UPDATE classes SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM employees);
ALTER TABLE classes ADD CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE SET NULL;


-- 3. Room Management adjustments
ALTER TABLE timetables ADD COLUMN room_id int(11) DEFAULT NULL AFTER end_time;
-- We are dropping room_number but let's do it safely
ALTER TABLE timetables DROP COLUMN room_number;
ALTER TABLE classes ADD COLUMN room_id int(11) DEFAULT NULL AFTER program_id;


-- 4. Add UNIQUE keys
-- We use IGNORE to skip duplicates if any exist in the database currently
ALTER TABLE enrollments ADD UNIQUE KEY unique_enrollment (student_id, course_id, semester);
ALTER TABLE timetables ADD UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, start_time, academic_year, semester);
ALTER TABLE timetables ADD UNIQUE KEY unique_room_slot (room_id, day_of_week, start_time, academic_year, semester);


-- 5. Merge system_logs and audit_logs (by renaming and adding type)
ALTER TABLE system_logs RENAME TO audit_logs;
ALTER TABLE audit_logs ADD COLUMN log_type enum('system','security','academic','finance') DEFAULT 'system' AFTER action;


-- 6. Fix finance_challans.semester
ALTER TABLE finance_challans ADD COLUMN semester_id int(11) DEFAULT NULL AFTER status;
ALTER TABLE finance_challans DROP COLUMN semester;

-- 7. Normalization Issues identified
-- courses.teacher_id -> wait, the document says courses.teacher_id is M:1 confusion so REMOVE.
-- But the same document earlier said "Enforce FK on courses.teacher_id". 
-- We will keep the FK for now, and handle teacher_section_assignments in Phase 2.
-- Duplicate logging merged above.
-- students.current_gpa doesn't exist so skipped.

