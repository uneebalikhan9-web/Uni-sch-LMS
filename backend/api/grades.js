const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');

const router = express.Router();

// Teacher: Add or Update Grade
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { student_id, course_id, exam_type, marks_obtained, max_marks, exam_date, remarks } = req.body;
    const teacher_id = req.user.employee_id;

    if (!student_id || !course_id || !exam_type || marks_obtained === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify teacher owns this course
    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [course_id, teacher_id]
    );

    if (courses.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this course' });
    }

    // Calculate percentage and grade letter
    const finalMaxMarks = max_marks || 100;
    const percentage = (marks_obtained / finalMaxMarks) * 100;
    let gradeLetter = 'F';
    if (percentage >= 90) gradeLetter = 'A+';
    else if (percentage >= 80) gradeLetter = 'A';
    else if (percentage >= 70) gradeLetter = 'B+';
    else if (percentage >= 60) gradeLetter = 'B';
    else if (percentage >= 50) gradeLetter = 'C';
    else if (percentage >= 40) gradeLetter = 'D';

    const [result] = await pool.query(
      `INSERT INTO grades (student_id, course_id, teacher_id, exam_type, marks_obtained, max_marks, grade_letter, percentage, exam_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, course_id, teacher_id, exam_type, marks_obtained, finalMaxMarks, gradeLetter, percentage, exam_date, remarks]
    );

    res.status(201).json({
      success: true,
      message: 'Grade added successfully',
      grade: {
        id: result.insertId,
        grade_letter: gradeLetter,
        percentage: percentage.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ success: false, message: 'Error adding grade' });
  }
});

// Teacher: Bulk Add Grades
router.post('/bulk', verifyToken, isTeacher, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { course_id, exam_type, max_marks, exam_date, grades } = req.body;
    const teacher_id = req.user.employee_id;

    if (!course_id || !exam_type || !exam_date || !grades || !Array.isArray(grades)) {
      return res.status(400).json({ success: false, message: 'Missing required bulk data' });
    }

    // Verify teacher owns this course
    const [courses] = await connection.query(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [course_id, teacher_id]
    );

    if (courses.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this course' });
    }

    await connection.beginTransaction();

    const finalMaxMarks = max_marks || 100;

    for (const g of grades) {
      const { student_id, marks_obtained, remarks } = g;
      
      if (!student_id) continue; // Skip invalid entries

      // Calculate percentage and grade letter
      const percentage = (marks_obtained / finalMaxMarks) * 100;
      let gradeLetter = 'F';
      if (percentage >= 90) gradeLetter = 'A+';
      else if (percentage >= 80) gradeLetter = 'A';
      else if (percentage >= 70) gradeLetter = 'B+';
      else if (percentage >= 60) gradeLetter = 'B';
      else if (percentage >= 50) gradeLetter = 'C';
      else if (percentage >= 40) gradeLetter = 'D';

      await connection.query(
        `INSERT INTO grades (student_id, course_id, teacher_id, exam_type, marks_obtained, max_marks, grade_letter, percentage, exam_date, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, course_id, teacher_id, exam_type, marks_obtained, finalMaxMarks, gradeLetter, percentage, exam_date, remarks]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: `Successfully saved ${grades.length} grades` });

  } catch (error) {
    await connection.rollback();
    console.error('Bulk grade error:', error);
    res.status(500).json({ success: false, message: 'Error processing bulk grades' });
  } finally {
    connection.release();
  }
});

// Teacher: Get all grades for a course
router.get('/course/:courseId', verifyToken, isTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacher_id = req.user.employee_id;

    // Verify teacher owns this course
    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [courseId, teacher_id]
    );

    if (courses.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this course' });
    }

    const [grades] = await pool.query(
      `SELECT g.*, u.name as student_name, u.email as student_email
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE g.course_id = ?
       ORDER BY u.name, g.exam_date DESC`,
      [courseId]
    );

    res.status(200).json({ success: true, grades });
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({ success: false, message: 'Error fetching grades' });
  }
});

// Teacher: Update Grade
router.put('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, max_marks, remarks, exam_type, exam_date } = req.body;
    const teacher_id = req.user.employee_id;

    // Verify teacher owns this grade
    const [grades] = await pool.query(
      `SELECT g.* FROM grades g
       JOIN courses c ON g.course_id = c.id
       WHERE g.id = ? AND c.teacher_id = ?`,
      [id, teacher_id]
    );

    if (grades.length === 0) {
      return res.status(403).json({ success: false, message: 'Grade not found or access denied' });
    }

    const finalMaxMarks = max_marks || grades[0].max_marks;
    const finalExamType = exam_type || grades[0].exam_type;
    const finalExamDate = exam_date || grades[0].exam_date;
    const percentage = (marks_obtained / finalMaxMarks) * 100;
    
    let gradeLetter = 'F';
    if (percentage >= 90) gradeLetter = 'A+';
    else if (percentage >= 80) gradeLetter = 'A';
    else if (percentage >= 70) gradeLetter = 'B+';
    else if (percentage >= 60) gradeLetter = 'B';
    else if (percentage >= 50) gradeLetter = 'C';
    else if (percentage >= 40) gradeLetter = 'D';

    await pool.query(
      `UPDATE grades SET marks_obtained = ?, max_marks = ?, exam_type = ?, exam_date = ?, grade_letter = ?, percentage = ?, remarks = ?
       WHERE id = ?`,
      [marks_obtained, finalMaxMarks, finalExamType, finalExamDate, gradeLetter, percentage, remarks, id]
    );

    res.status(200).json({ success: true, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ success: false, message: 'Error updating grade' });
  }
});

// Teacher: Delete Grade
router.delete('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.employee_id;

    // Verify teacher owns this grade
    const [grades] = await pool.query(
      `SELECT g.* FROM grades g
       JOIN courses c ON g.course_id = c.id
       WHERE g.id = ? AND c.teacher_id = ?`,
      [id, teacher_id]
    );

    if (grades.length === 0) {
      return res.status(403).json({ success: false, message: 'Grade not found or access denied' });
    }

    await pool.query('DELETE FROM grades WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ success: false, message: 'Error deleting grade' });
  }
});

// Student: Get My Grades
router.get('/my-grades', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [grades] = await pool.query(
      `SELECT g.*, c.title as course_title, u.name as teacher_name
       FROM grades g
       JOIN courses c ON g.course_id = c.id
       JOIN employees e ON g.teacher_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE g.student_id = ?
       ORDER BY g.exam_date DESC`,
      [student_id]
    );

    // Group by course
    const groupedGrades = {};
    grades.forEach(grade => {
      if (!groupedGrades[grade.course_id]) {
        groupedGrades[grade.course_id] = {
          course_id: grade.course_id,
          course_title: grade.course_title,
          teacher_name: grade.teacher_name,
          grades: []
        };
      }
      groupedGrades[grade.course_id].grades.push(grade);
    });

    res.status(200).json({
      success: true,
      grades: Object.values(groupedGrades)
    });
  } catch (error) {
    console.error('Get my grades error:', error);
    res.status(500).json({ success: false, message: 'Error fetching grades' });
  }
});

module.exports = router;
