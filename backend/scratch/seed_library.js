const { pool } = require('../config/database');

async function run() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Clearing old library tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE book_issues');
    await connection.query('TRUNCATE TABLE books');
    await connection.query('TRUNCATE TABLE library_members');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Inserting books...');
    const books = [
      ['Introduction to Algorithms', '978-0262033848', 'Thomas H. Cormen', 'CS / Engineering', 10, 8],
      ['Computer Networks', '978-0132126953', 'Andrew S. Tanenbaum', 'CS / Engineering', 6, 5],
      ['Database System Concepts', '978-0073523323', 'Abraham Silberschatz', 'CS / Engineering', 8, 7],
      ['Artificial Intelligence: A Modern Approach', '978-0136086208', 'Stuart Russell', 'CS / Engineering', 5, 2],
      ['Operating System Concepts', '978-1118063330', 'Abraham Silberschatz', 'CS / Engineering', 7, 7],
      ['Business Psychology and Organisational Behaviour', '978-1848721593', 'Eugene McKenna', 'Management', 12, 10],
      ['Principles of Marketing', '978-0134492513', 'Philip Kotler', 'Management', 9, 8],
      ['Advanced Engineering Mathematics', '978-0470458365', 'Erwin Kreyszig', 'Mathematics', 15, 14]
    ];

    const bookIds = [];
    for (const b of books) {
      const [res] = await connection.query(
        'INSERT INTO books (title, isbn, author, category, stock, available) VALUES (?, ?, ?, ?, ?, ?)',
        b
      );
      bookIds.push({ id: res.insertId, title: b[0] });
    }
    console.log(`Inserted ${bookIds.length} books.`);

    console.log('Fetching active students from users table...');
    const [students] = await connection.query("SELECT id, name, email FROM users WHERE role = 'student' LIMIT 5");
    
    if (students.length === 0) {
      console.log('No students found to link as library members.');
      await connection.commit();
      return;
    }

    console.log('Inserting library members...');
    const departments = ['Computer Science', 'Software Engineering', 'Business Administration', 'Electrical Engineering', 'Mathematics'];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Active'];
    
    const memberIds = [];
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const dept = departments[i % departments.length];
      const status = statuses[i % statuses.length];
      
      const [res] = await connection.query(
        'INSERT INTO library_members (name, email, role, department, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [s.name, s.email, 'student', dept, status]
      );
      memberIds.push({ id: res.insertId, name: s.name, userId: s.id });
    }
    console.log(`Inserted ${memberIds.length} library members.`);

    console.log('Inserting book issues...');
    // Let's create some issues
    // Issue 1: Active issue (Issued)
    const today = new Date();
    const issueDate1 = new Date(today);
    issueDate1.setDate(today.getDate() - 3);
    const dueDate1 = new Date(today);
    dueDate1.setDate(today.getDate() + 7);

    await connection.query(
      'INSERT INTO book_issues (book_id, user_id, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [bookIds[0].id, memberIds[0].userId, issueDate1, dueDate1, 'issued']
    );

    // Issue 2: Active issue (Overdue)
    const issueDate2 = new Date(today);
    issueDate2.setDate(today.getDate() - 15);
    const dueDate2 = new Date(today);
    dueDate2.setDate(today.getDate() - 5); // 5 days overdue!

    await connection.query(
      'INSERT INTO book_issues (book_id, user_id, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [bookIds[1].id, memberIds[1].userId, issueDate2, dueDate2, 'overdue']
    );

    // Issue 3: Concluded issue (Returned)
    const issueDate3 = new Date(today);
    issueDate3.setDate(today.getDate() - 10);
    const dueDate3 = new Date(today);
    dueDate3.setDate(today.getDate() - 2);
    const returnDate3 = new Date(today);
    returnDate3.setDate(today.getDate() - 3);

    await connection.query(
      'INSERT INTO book_issues (book_id, user_id, issue_date, due_date, return_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [bookIds[2].id, memberIds[2].userId, issueDate3, dueDate3, returnDate3, 'returned']
    );

    console.log('Linking and committing library transactions...');
    await connection.commit();
    console.log('Library successfully seeded with realistic dynamic datasets!');
  } catch (error) {
    await connection.rollback();
    console.error('Seeding error:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

run();
