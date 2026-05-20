const { pool } = require('../config/database');

async function run() {
  try {
    // 1. Get courses
    const [courses] = await pool.query('SELECT id, title FROM courses');
    console.log('Available courses:', courses.map(c => `${c.id}: ${c.title}`));
    
    if (courses.length === 0) {
      console.log('No courses to seed exams for.');
      process.exit();
    }

    // 2. Get students
    const [students] = await pool.query('SELECT id FROM students');
    console.log('Available student IDs:', students.map(s => s.id));
    
    if (students.length === 0) {
      console.log('No students to seed exam results for.');
      process.exit();
    }

    // Clear existing exams and results first to avoid duplicates
    console.log('Cleaning old exams and results...');
    await pool.query('DELETE FROM exam_results');
    await pool.query('DELETE FROM exams');

    // 3. Seed Exams
    console.log('Seeding exams...');
    const examData = [
      { course_id: courses[0].id, name: 'Midterm Examination', exam_date: '2026-05-10', max_marks: 100, room_number: 'Room 302' },
      { course_id: courses[1] ? courses[1].id : courses[0].id, name: 'Final Examination', exam_date: '2026-05-15', max_marks: 100, room_number: 'Main Hall A' }
    ];

    if (courses.length > 2) {
      examData.push({ course_id: courses[2].id, name: 'Lab Practical', exam_date: '2026-05-18', max_marks: 50, room_number: 'Lab 04' });
    }

    const seededExams = [];
    for (const exam of examData) {
      const [result] = await pool.query(
        'INSERT INTO exams (course_id, name, exam_date, max_marks, room_number) VALUES (?, ?, ?, ?, ?)',
        [exam.course_id, exam.name, exam.exam_date, exam.max_marks, exam.room_number]
      );
      seededExams.push({ id: result.insertId, max_marks: exam.max_marks });
    }
    console.log(`Seeded ${seededExams.length} exams.`);

    // 4. Seed Exam Results for all active students
    console.log('Seeding exam results...');
    const remarksOptions = ['Outstanding performance', 'Satisfactory', 'Needs improvement', 'Excellent grasp of concepts', 'Good effort'];
    
    for (const exam of seededExams) {
      for (const student of students) {
        // Calculate random realistic mark based on student ID to have a stable seeded distribution
        const max = exam.max_marks;
        const baseMark = 50 + (student.id * 7) % 45; // results in marks between 50 and 95
        const marks_obtained = Math.min(baseMark, max);
        const gpa = (marks_obtained / max) * 4;
        
        let grade = 'F';
        const percentage = (marks_obtained / max) * 100;
        if (percentage >= 85) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 50) grade = 'C';

        const remarks = remarksOptions[student.id % remarksOptions.length];

        await pool.query(
          'INSERT INTO exam_results (exam_id, student_id, marks_obtained, grade, gpa, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [exam.id, student.id, marks_obtained, grade, gpa, remarks]
        );
      }
    }
    console.log('Exam results seeded successfully for all students!');
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
