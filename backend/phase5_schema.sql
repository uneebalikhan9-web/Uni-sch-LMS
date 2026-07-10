-- Phase 5: Reporting & Graduation Audit Schema

-- 1. Graduation Requirements
CREATE TABLE IF NOT EXISTS `graduation_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `required_credits` int(11) NOT NULL DEFAULT 130,
  `minimum_cgpa` decimal(3,2) NOT NULL DEFAULT 2.00,
  `mandatory_courses` text DEFAULT NULL, -- Comma-separated course IDs
  `graduation_fee` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Graduation Applications
CREATE TABLE IF NOT EXISTS `graduation_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `application_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected','on_hold') DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `audit_data` longtext DEFAULT NULL, -- JSON snapshot of the audit at the time of approval
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Student Transcript View
CREATE OR REPLACE VIEW `vw_student_transcript` AS
SELECT 
    s.id AS student_id,
    s.roll_number,
    u.name AS student_name,
    s.father_name,
    s.cnic,
    s.bform_number,
    p.name AS program_name,
    p.code AS program_code,
    c.title AS course_title,
    c.code AS course_code,
    c.credit_hours,
    e.semester AS enrollment_semester,
    er.marks_obtained,
    er.grade,
    er.gpa
FROM students s
JOIN users u ON s.user_id = u.id
JOIN programs p ON s.program_id = p.id
JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
LEFT JOIN exams ex ON ex.course_id = c.id
LEFT JOIN exam_results er ON er.exam_id = ex.id AND er.student_id = s.id
WHERE e.status = 'completed' OR e.status = 'enrolled';

-- 4. Graduation Audit Stored Procedure
DELIMITER //
DROP PROCEDURE IF EXISTS `sp_graduation_audit`//
CREATE PROCEDURE `sp_graduation_audit` (IN p_student_id INT)
BEGIN
    DECLARE v_program_id INT;
    DECLARE v_required_credits INT DEFAULT 0;
    DECLARE v_minimum_cgpa DECIMAL(3,2) DEFAULT 0.00;
    DECLARE v_earned_credits INT DEFAULT 0;
    DECLARE v_current_cgpa DECIMAL(3,2) DEFAULT 0.00;
    DECLARE v_unpaid_fees DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_is_eligible BOOLEAN DEFAULT FALSE;
    DECLARE v_message VARCHAR(255) DEFAULT '';
    
    -- Get Student Program and CGPA
    SELECT program_id, current_gpa INTO v_program_id, v_current_cgpa 
    FROM students 
    WHERE id = p_student_id;
    
    -- Get Graduation Requirements
    SELECT required_credits, minimum_cgpa INTO v_required_credits, v_minimum_cgpa 
    FROM graduation_requirements 
    WHERE program_id = v_program_id LIMIT 1;
    
    -- If no specific requirements found, fallback to program defaults
    IF v_required_credits = 0 THEN
        SELECT credit_requirements INTO v_required_credits FROM programs WHERE id = v_program_id;
        SET v_minimum_cgpa = 2.00; -- Default minimum
    END IF;
    
    -- Calculate Earned Credits (only count completed courses with passing grades)
    SELECT IFNULL(SUM(c.credit_hours), 0) INTO v_earned_credits
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN exams ex ON ex.course_id = c.id
    LEFT JOIN exam_results er ON er.exam_id = ex.id AND er.student_id = e.student_id
    WHERE e.student_id = p_student_id 
      AND e.status = 'completed' 
      AND er.grade IS NOT NULL 
      AND er.grade != 'F';

    -- Check Unpaid Fees
    SELECT IFNULL(SUM(amount), 0) INTO v_unpaid_fees
    FROM finance_challans
    WHERE student_id = p_student_id AND status != 'paid' AND status != 'cancelled';
    
    -- Evaluate Eligibility
    IF v_earned_credits >= v_required_credits AND v_current_cgpa >= v_minimum_cgpa AND v_unpaid_fees = 0 THEN
        SET v_is_eligible = TRUE;
        SET v_message = 'Eligible for Graduation';
    ELSE
        SET v_is_eligible = FALSE;
        SET v_message = CONCAT_WS(', ', 
            IF(v_earned_credits < v_required_credits, CONCAT('Short of Credits: ', v_required_credits - v_earned_credits), NULL),
            IF(v_current_cgpa < v_minimum_cgpa, 'CGPA Below Minimum', NULL),
            IF(v_unpaid_fees > 0, 'Unpaid Dues', NULL)
        );
    END IF;
    
    -- Return Result Set
    SELECT 
        v_is_eligible AS is_eligible,
        v_message AS audit_message,
        v_required_credits AS required_credits,
        v_earned_credits AS earned_credits,
        v_minimum_cgpa AS minimum_cgpa,
        v_current_cgpa AS current_cgpa,
        v_unpaid_fees AS unpaid_fees;
END //
DELIMITER ;
