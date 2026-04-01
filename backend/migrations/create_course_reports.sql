-- Run this once in MySQL to create the course_reports table
CREATE TABLE IF NOT EXISTS course_reports (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  course_id         INT NOT NULL,
  course_title      VARCHAR(255),
  class_name        VARCHAR(255),
  campus_id         INT,
  campus_name       VARCHAR(255),
  teacher_id        INT,
  teacher_name      VARCHAR(255),
  total_students    INT DEFAULT 0,
  avg_attendance    DECIMAL(5,2) DEFAULT 0,
  avg_marks         DECIMAL(5,2) DEFAULT 0,
  pass_count        INT DEFAULT 0,
  fail_count        INT DEFAULT 0,
  total_assignments INT DEFAULT 0,
  completed_at      DATETIME DEFAULT NOW(),
  generated_by_role VARCHAR(50),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
