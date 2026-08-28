const express = require('express');
const path = require('path');
const { pool } = require('../config/database');
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const { uploadSubmission, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Student uploads submission file
router.post('/:assignmentId/submit', verifyToken, uploadSubmission.single('file'), handleUploadError, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    let studentId = req.user.student_id;
    const { submission_text } = req.body;

    if (!studentId) {
      const [st] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (st.length > 0) {
        studentId = st[0].id;
      } else {
        const [newSt] = await pool.query('INSERT INTO students (user_id, roll_number, academic_status) VALUES (?, ?, ?)', [req.user.id, 'STU-' + req.user.id, 'active']);
        studentId = newSt.insertId;
      }
    }
    
    // Check if already submitted
    const [existing] = await pool.query(
      'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );
    
    if (existing.length > 0) {
      // Update existing submission
      await pool.query(
        'UPDATE submissions SET submission_text = ?, file_path = IFNULL(?, file_path), submitted_file_name = IFNULL(?, submitted_file_name), submitted_at = NOW() WHERE id = ?',
        [submission_text, req.file?.path || null, req.file?.originalname || null, existing[0].id]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Submission updated successfully'
      });
    }
    
    // Create new submission
    await pool.query(
      'INSERT INTO submissions (assignment_id, student_id, submission_text, file_path, submitted_file_name, submitted_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [assignmentId, studentId, submission_text, req.file?.path || null, req.file?.originalname || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Submission uploaded successfully'
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading submission: ' + error.message
    });
  }
});

// Download submission file (teacher only)
router.get('/:submissionId/download', verifyToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const [submissions] = await pool.query(
      'SELECT file_path, submitted_file_name FROM submissions WHERE id = ?',
      [submissionId]
    );
    
    if (submissions.length === 0 || !submissions[0].file_path) {
      return res.status(404).json({
        success: false,
        message: 'Submission file not found'
      });
    }
    
    const filePath = submissions[0].file_path;
    const fileName = submissions[0].submitted_file_name;
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// Get student's assignments for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.student_id;
    
    const [assignments] = await pool.query(`
      SELECT 
        a.*,
        s.id as submission_id,
        s.submitted_at,
        s.file_path as submitted_file,
        s.marks_obtained,
        s.feedback
      FROM assignments a
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE a.course_id = ?
      ORDER BY a.created_at DESC
    `, [studentId, courseId]);
    
    res.status(200).json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments'
    });
  }
});

// Teacher: Get all submissions for an assignment
router.get('/assignment/:assignmentId', verifyToken, async (req, res) => { // Removed isTeacher middleware temporarily or ensure it's imported if strict check needed
  try {
    const { assignmentId } = req.params;
    
    const [submissions] = await pool.query(`
      SELECT 
        s.*,
        u.name as student_name,
        u.email as student_email
      FROM submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching submissions' });
  }
});

// Teacher: Grade a submission
router.put('/:id/grade', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;
    const teacher_id = req.user.employee_id;

    await pool.query(
      'UPDATE submissions SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = NOW() WHERE id = ?',
      [marks_obtained, feedback, teacher_id, id]
    );

    res.status(200).json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ success: false, message: 'Error grading submission' });
  }
});

// Student: Track watch time for video lectures
router.post('/watch-time', verifyToken, isStudent, async (req, res) => {
  try {
    const { assignment_id, seconds_watched } = req.body;
    const student_id = req.user.student_id;
    
    if (!assignment_id || !seconds_watched) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Upsert into submissions: if it doesn't exist, insert it. If it does, add to watch_time_seconds
    await pool.query(`
      INSERT INTO submissions (assignment_id, student_id, watch_time_seconds, submitted_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        watch_time_seconds = IFNULL(watch_time_seconds, 0) + VALUES(watch_time_seconds),
        submitted_at = NOW()
    `, [assignment_id, student_id, seconds_watched]);

    res.status(200).json({ success: true, message: 'Watch time updated' });
  } catch (error) {
    console.error('Watch time error:', error);
    res.status(500).json({ success: false, message: 'Error updating watch time' });
  }
});


// Student: Mark video as completed
router.post('/video-completed', verifyToken, isStudent, async (req, res) => {
  try {
    const { assignment_id } = req.body;
    const student_id = req.user.student_id;
    
    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'Missing assignment_id' });
    }

    try {
      await pool.query(`
        INSERT INTO submissions (assignment_id, student_id, is_video_completed, submitted_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE 
          is_video_completed = 1
      `, [assignment_id, student_id]);
      return res.status(200).json({ success: true, message: 'Video marked as completed' });
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR' || dbErr.errno === 1054) {
        console.log('Adding missing is_video_completed column to submissions table...');
        try {
          await pool.query('ALTER TABLE submissions ADD COLUMN is_video_completed TINYINT(1) DEFAULT 0');
        } catch (alterErr) { console.warn('Alter table note:', alterErr.message); }
        
        await pool.query(`
          INSERT INTO submissions (assignment_id, student_id, is_video_completed, submitted_at)
          VALUES (?, ?, 1, NOW())
          ON DUPLICATE KEY UPDATE 
            is_video_completed = 1
        `, [assignment_id, student_id]);
        return res.status(200).json({ success: true, message: 'Video marked as completed' });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('Video completion error:', error);
    res.status(500).json({ success: false, message: 'Error marking video as completed' });
  }
});

module.exports = router;
