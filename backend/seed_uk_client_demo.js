const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_lms'
  });

  try {
    console.log('Beginning UK Client Demo Data Seeding...');
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash('password123', 10);
    const sqlStatements = [];

    const formatValues = (values) => {
      return values.map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'string') return "'" + v.replace(/'/g, "\\'") + "'";
        return v;
      }).join(', ');
    };

    // 1. Create Department
    const [deptResult] = await connection.execute(
      `INSERT INTO campuses (name, location, subscription_plan, is_active, dept_code) VALUES (?, ?, ?, ?, ?)`,
      ["Department of Data Science & AI", "London, UK Campus", "premium", 1, "DSAI"]
    );
    const campusId = deptResult.insertId;
    sqlStatements.push(`INSERT INTO campuses (name, location, subscription_plan, is_active, dept_code) VALUES ('Department of Data Science & AI', 'London, UK Campus', 'premium', 1, 'DSAI');`);

    // 2. Create HOD
    const [hodResult] = await connection.execute(
      `INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Dr. Eleanor Blackwood", "eleanor.blackwood@lancerstech.co.uk", passwordHash, "principal", 1, campusId]
    );
    const hodId = hodResult.insertId;
    sqlStatements.push(`SET @campus_id = LAST_INSERT_ID();`);
    sqlStatements.push(`INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES ('Dr. Eleanor Blackwood', 'eleanor.blackwood@lancerstech.co.uk', '${passwordHash}', 'principal', 1, @campus_id);`);

    // 3. Create Teachers
    const teachers = [
      { name: "Mr. Charles Sterling", email: "c.sterling@lancerstech.co.uk" },
      { name: "Ms. Penelope Hughes", email: "p.hughes@lancerstech.co.uk" },
      { name: "Dr. James Harrington", email: "j.harrington@lancerstech.co.uk" },
      { name: "Ms. Victoria Kensington", email: "v.kensington@lancerstech.co.uk" }
    ];
    const teacherIds = [];
    for (const t of teachers) {
      const [res] = await connection.execute(
        `INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [t.name, t.email, passwordHash, "teacher", 1, campusId]
      );
      teacherIds.push(res.insertId);
      sqlStatements.push(`INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES ('${t.name}', '${t.email}', '${passwordHash}', 'teacher', 1, @campus_id);`);
    }

    // 4. Create Students
    const students = [
      { name: "Oliver Williams", email: "oliver.w@student.lancerstech.co.uk", roll: "LUK-001" },
      { name: "Charlotte Brown", email: "charlotte.b@student.lancerstech.co.uk", roll: "LUK-002" },
      { name: "George Taylor", email: "george.t@student.lancerstech.co.uk", roll: "LUK-003" },
      { name: "Amelia Davies", email: "amelia.d@student.lancerstech.co.uk", roll: "LUK-004" },
      { name: "Harry Wilson", email: "harry.w@student.lancerstech.co.uk", roll: "LUK-005" }
    ];
    const studentIds = [];
    for (const s of students) {
      const [res] = await connection.execute(
        `INSERT INTO users (name, email, password, role, is_approved, campus_id, roll_number, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.email, passwordHash, "student", 1, campusId, s.roll, 2]
      );
      studentIds.push(res.insertId);
      sqlStatements.push(`INSERT INTO users (name, email, password, role, is_approved, campus_id, roll_number, semester) VALUES ('${s.name}', '${s.email}', '${passwordHash}', 'student', 1, @campus_id, '${s.roll}', 2);`);
    }

    // 5. Create Completed Courses
    const coursesData = [
      { title: "Advanced Artificial Intelligence", desc: "Deep learning and neural network architectures.", teacherId: teacherIds[0] },
      { title: "Cybersecurity and Ethical Hacking", desc: "Network security, cryptography, and penetration testing.", teacherId: teacherIds[1] },
      { title: "Data Science and Analytics", desc: "Big data processing, statistical modeling.", teacherId: teacherIds[2] },
      { title: "Blockchain Technologies", desc: "Decentralized applications and smart contracts.", teacherId: teacherIds[3] },
      { title: "Cloud Computing Architectures", desc: "AWS, Azure, and distributed systems design.", teacherId: teacherIds[0] }
    ];
    
    for (let c = 0; c < coursesData.length; c++) {
      const course = coursesData[c];
      const [cRes] = await connection.execute(
        `INSERT INTO courses (title, description, teacher_id, status, created_by_admin, campus_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [course.title, course.desc, course.teacherId, 'completed', 1, campusId]
      );
      const courseId = cRes.insertId;
      sqlStatements.push(`INSERT INTO courses (title, description, teacher_id, status, created_by_admin, campus_id) VALUES ('${course.title}', '${course.desc}', (SELECT id FROM users WHERE email='${teachers[teachers.findIndex(t => t.email.includes(course.teacherId === teacherIds[0] ? "c.sterling" : course.teacherId === teacherIds[1] ? "p.hughes" : course.teacherId === teacherIds[2] ? "j.harrington" : "v.kensington"))].email}' LIMIT 1), 'completed', 1, @campus_id);`);

      // Enroll students in all courses
      for (const sid of studentIds) {
        await connection.execute(`INSERT INTO enrollments (course_id, student_id, status) VALUES (?, ?, ?)`, [courseId, sid, 'approved']);
      }

      // Add Assignments for the course
      for (let i = 1; i <= 3; i++) {
        const [aRes] = await connection.execute(
          `INSERT INTO assignments (course_id, teacher_id, title, description, max_marks, status, assignment_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [courseId, course.teacherId, `Final Project Phase ${i} - ${course.title}`, `Comprehensive evaluation of module ${i}.`, 100, 'published', 'Homework']
        );
        const assignId = aRes.insertId;

        // Submissions & Grades
        for (const sid of studentIds) {
          const score = Math.floor(Math.random() * (100 - 75 + 1)) + 75; // Random score 75-100
          await connection.execute(
            `INSERT INTO submissions (assignment_id, student_id, submission_text, marks_obtained, feedback, graded_by, graded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [assignId, sid, `Complete submission for phase ${i}`, score, `Excellent understanding of the core concepts demonstrated. Minor improvements needed in documentation.`, course.teacherId]
          );
        }
      }
    }

    await connection.commit();
    console.log('✅ Successfully seeded UK Client Demo Data.');
    
    // Save to SQL file
    fs.writeFileSync('UK_CLIENT_DEMO.sql', sqlStatements.join('\\n'));
    console.log('✅ Generated UK_CLIENT_DEMO.sql');

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ Error seeding data:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedData();
