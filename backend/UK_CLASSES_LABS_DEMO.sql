-- Get IDs
SET @campus_id = (SELECT id FROM campuses WHERE dept_code = 'DSAI' LIMIT 1);
SET @hod_id = (SELECT id FROM users WHERE role = 'principal' AND campus_id = @campus_id LIMIT 1);

-- Get Teacher IDs
SET @teacher1_id = (SELECT id FROM users WHERE email = 'c.sterling@lancerstech.co.uk' LIMIT 1);
SET @teacher2_id = (SELECT id FROM users WHERE email = 'p.hughes@lancerstech.co.uk' LIMIT 1);
SET @teacher3_id = (SELECT id FROM users WHERE email = 'j.harrington@lancerstech.co.uk' LIMIT 1);

-- 1. Create a Class
INSERT INTO classes (name, section, academic_year, teacher_id, campus_id) 
VALUES ('BSc Computer Science - AI Stream', 'Group A', '2026-2027', @teacher1_id, @campus_id);

SET @class_id = LAST_INSERT_ID();

-- 2. Enroll Students into student_classes
INSERT INTO student_classes (student_id, class_id) SELECT id, @class_id FROM users WHERE role = 'student' AND campus_id = @campus_id;

-- 3. Create Ongoing Courses
INSERT INTO courses (title, description, class_id, teacher_id, status, created_by_admin, campus_id) 
VALUES ('Machine Learning Fundamentals', 'Supervised and Unsupervised Learning techniques.', @class_id, @teacher1_id, 'active', 1, @campus_id);
SET @course1_id = LAST_INSERT_ID();
INSERT INTO class_courses (class_id, course_id) VALUES (@class_id, @course1_id);
INSERT INTO enrollments (course_id, student_id, status) SELECT @course1_id, id, 'approved' FROM users WHERE role = 'student' AND campus_id = @campus_id;

INSERT INTO courses (title, description, class_id, teacher_id, status, created_by_admin, campus_id) 
VALUES ('Cloud Infrastructure Lab', 'Setting up virtual instances and containers.', @class_id, @teacher2_id, 'active', 1, @campus_id);
SET @course2_id = LAST_INSERT_ID();
INSERT INTO class_courses (class_id, course_id) VALUES (@class_id, @course2_id);
INSERT INTO enrollments (course_id, student_id, status) SELECT @course2_id, id, 'approved' FROM users WHERE role = 'student' AND campus_id = @campus_id;

INSERT INTO courses (title, description, class_id, teacher_id, status, created_by_admin, campus_id) 
VALUES ('Ethics in Artificial Intelligence', 'Bias, fairness, and ethical issues in AI.', @class_id, @teacher3_id, 'active', 1, @campus_id);
SET @course3_id = LAST_INSERT_ID();
INSERT INTO class_courses (class_id, course_id) VALUES (@class_id, @course3_id);
INSERT INTO enrollments (course_id, student_id, status) SELECT @course3_id, id, 'approved' FROM users WHERE role = 'student' AND campus_id = @campus_id;

-- 4. Create Timetable entries
INSERT INTO timetables (class_id, course_id, teacher_id, day_of_week, start_time, end_time, subject, room_number, academic_year, semester, campus_id) 
VALUES (@class_id, @course1_id, @teacher1_id, 'Monday', '09:00:00', '11:00:00', 'Machine Learning Fundamentals', 'Room 101', '2026-2027', '2', @campus_id);

INSERT INTO timetables (class_id, course_id, teacher_id, day_of_week, start_time, end_time, subject, room_number, academic_year, semester, campus_id) 
VALUES (@class_id, @course2_id, @teacher2_id, 'Tuesday', '09:00:00', '11:00:00', 'Cloud Infrastructure Lab', 'Room 102', '2026-2027', '2', @campus_id);

INSERT INTO timetables (class_id, course_id, teacher_id, day_of_week, start_time, end_time, subject, room_number, academic_year, semester, campus_id) 
VALUES (@class_id, @course3_id, @teacher3_id, 'Wednesday', '09:00:00', '11:00:00', 'Ethics in Artificial Intelligence', 'Room 103', '2026-2027', '2', @campus_id);

-- 5. Create Labs
INSERT INTO labs (name, description, icon, url, class_id, hod_id, campus_id, environment) 
VALUES ('AWS ML Cloud Environment', 'High-performance computing instances for PyTorch.', 'Flask', 'https://lab.lancerstech.co.uk', @class_id, @hod_id, @campus_id, 'Python');
SET @lab1_id = LAST_INSERT_ID();

INSERT INTO labs (name, description, icon, url, class_id, hod_id, campus_id, environment) 
VALUES ('Cyber Range Simulation', 'Virtual sandbox for penetration testing.', 'Terminal', 'https://lab.lancerstech.co.uk', @class_id, @hod_id, @campus_id, 'Linux');
SET @lab2_id = LAST_INSERT_ID();

-- 6. Create Lab Usage (Lab Reports)
INSERT INTO lab_usage (student_id, lab_name, start_time, end_time, time_spent, date, submission_code) 
SELECT id, 'AWS ML Cloud Environment', NOW() - INTERVAL 2 HOUR, NOW(), 120, CURRENT_DATE(), 'print(''Lab session completed fully'')' FROM users WHERE role = 'student' AND campus_id = @campus_id;

INSERT INTO lab_usage (student_id, lab_name, start_time, end_time, time_spent, date, submission_code) 
SELECT id, 'Cyber Range Simulation', NOW() - INTERVAL 2 HOUR, NOW(), 120, CURRENT_DATE(), 'print(''Lab session completed fully'')' FROM users WHERE role = 'student' AND campus_id = @campus_id;

-- 7. Create Lab Feedback
INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) 
SELECT id, NULL, @lab1_id, 5, 'Excellent environment, fast provisioning.' FROM users WHERE role = 'student' AND campus_id = @campus_id LIMIT 1 OFFSET 0;

INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) 
SELECT id, NULL, @lab1_id, 4, 'Really smooth experience setting up the Docker containers.' FROM users WHERE role = 'student' AND campus_id = @campus_id LIMIT 1 OFFSET 1;

INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) 
SELECT id, NULL, @lab1_id, 5, 'Good performance!' FROM users WHERE role = 'student' AND campus_id = @campus_id LIMIT 1 OFFSET 2;

INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) 
SELECT id, NULL, @lab2_id, 5, 'Loved the hands-on practice, very responsive lab.' FROM users WHERE role = 'student' AND campus_id = @campus_id LIMIT 1 OFFSET 3;

INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) 
SELECT id, NULL, @lab2_id, 4, 'Great setup.' FROM users WHERE role = 'student' AND campus_id = @campus_id LIMIT 1 OFFSET 4;
