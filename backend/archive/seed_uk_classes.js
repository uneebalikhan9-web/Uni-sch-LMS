const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedClassesAndLabs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_lms'
  });

  try {
    console.log('Seeding UK Classes, Labs, and Timetables...');
    await connection.beginTransaction();

    // 1. Get Campus ID, HOD ID, Teachers and Students
    const [deptRes] = await connection.execute(`SELECT id FROM campuses WHERE dept_code = 'DSAI' LIMIT 1`);
    if (deptRes.length === 0) {
        console.error("Campus not found. Please run the first script.");
        return;
    }
    const campusId = deptRes[0].id;
    
    const [hodRes] = await connection.execute(`SELECT id FROM users WHERE role = 'principal' AND campus_id = ? LIMIT 1`, [campusId]);
    const hodId = hodRes[0].id;

    const [teachers] = await connection.execute(`SELECT id, name FROM users WHERE role = 'teacher' AND campus_id = ?`, [campusId]);
    const [students] = await connection.execute(`SELECT id, name FROM users WHERE role = 'student' AND campus_id = ?`, [campusId]);

    if (teachers.length < 2 || students.length === 0) {
        console.error("Not enough teachers or students found.");
        return;
    }

    // 2. Create a Class
    const [classRes] = await connection.execute(
      `INSERT INTO classes (name, section, academic_year, teacher_id, campus_id) VALUES (?, ?, ?, ?, ?)`,
      ["BSc Computer Science - AI Stream", "Group A", "2026-2027", teachers[0].id, campusId]
    );
    const classId = classRes.insertId;

    // Enroll students into class_courses or student_classes?
    // Wait, the DB has student_classes table. We will enroll them.
    for (const student of students) {
        await connection.execute(`INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)`, [student.id, classId]);
    }

    // 3. Create Ongoing Courses
    const ongoingCourses = [
      { title: "Machine Learning Fundamentals", desc: "Supervised and Unsupervised Learning techniques.", teacher_id: teachers[0].id },
      { title: "Cloud Infrastructure Lab", desc: "Setting up virtual instances and containers.", teacher_id: teachers[1].id },
      { title: "Ethics in Artificial Intelligence", desc: "Bias, fairness, and ethical issues in AI.", teacher_id: teachers[2].id }
    ];

    for (let c = 0; c < ongoingCourses.length; c++) {
      const course = ongoingCourses[c];
      
      const [cRes] = await connection.execute(
        `INSERT INTO courses (title, description, class_id, teacher_id, status, created_by_admin, campus_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [course.title, course.desc, classId, course.teacher_id, 'active', 1, campusId]
      );
      const courseId = cRes.insertId;

      // Link class and course
      await connection.execute(`INSERT INTO class_courses (class_id, course_id) VALUES (?, ?)`, [classId, courseId]);

      // Enroll students into the active courses
      for (const student of students) {
          await connection.execute(`INSERT INTO enrollments (course_id, student_id, status) VALUES (?, ?, 'approved')`, [courseId, student.id]);
      }

      // 4. Create Timetable entries for these courses
      const days = ["Monday", "Tuesday", "Wednesday"];
      const day = days[c % 3]; // Just assign a different day to each
      
      await connection.execute(
        `INSERT INTO timetables (class_id, course_id, teacher_id, day_of_week, start_time, end_time, subject, room_number, academic_year, semester, campus_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [classId, courseId, course.teacher_id, day, '09:00:00', '11:00:00', course.title, `Room ${101+c}`, '2026-2027', '2', campusId]
      );
    }

    // 5. Create Labs 
    const labs = [
      { name: "AWS ML Cloud Environment", desc: "High-performance computing instances for PyTorch.", icon: "Flask", env: "Python" },
      { name: "Cyber Range Simulation", desc: "Virtual sandbox for penetration testing.", icon: "Terminal", env: "Linux" }
    ];

    for (const lab of labs) {
      const [labRes] = await connection.execute(
        `INSERT INTO labs (name, description, icon, url, class_id, hod_id, campus_id, environment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [lab.name, lab.desc, lab.icon, 'https://lab.lancerstech.co.uk', classId, hodId, campusId, lab.env]
      );
      const labId = labRes.insertId;

      // 6. Create Lab Feedback / Usage (Lab Reports)
      for (let s=0; s < students.length; s++) {
        const student = students[s];
        
        // Add lab usage
        await connection.execute(
          `INSERT INTO lab_usage (student_id, lab_name, start_time, end_time, time_spent, date, submission_code) VALUES (?, ?, NOW() - INTERVAL 2 HOUR, NOW(), 120, CURRENT_DATE(), ?)`,
          [student.id, lab.name, "print('Lab session completed fully')"]
        );

        // Add lab feedback
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 rating
        const comments = [
            "Excellent environment, fast provisioning.",
            "Really smooth experience setting up the Docker containers.",
            "Good performance, but occasionally timed out.",
            "Loved the hands-on practice, very responsive lab."
        ];
        
        await connection.execute(
          `INSERT INTO feedback (student_id, course_id, lab_id, rating, comment) VALUES (?, NULL, ?, ?, ?)`,
          [student.id, labId, rating, comments[s % comments.length]]
        );
      }
    }

    await connection.commit();
    console.log('✅ Successfully seeded Classes, Ongoing Courses, Timetables, Labs, and Lab Reports.');

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ Error seeding data:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedClassesAndLabs();
