const { pool } = require('../config/database');

async function run() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Clearing old library tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE library_transactions');
    await connection.query('TRUNCATE TABLE library_books');
    await connection.query('TRUNCATE TABLE library_members');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Inserting books into library_books...');
    const books = [
      ['Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'CS / Engineering', 'Shelf A-4', 'Issued'],
      ['Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'CS / Engineering', 'Shelf B-2', 'Available'],
      ['Database System Concepts', 'Abraham Silberschatz', '978-0073523323', 'CS / Engineering', 'Shelf A-1', 'Available'],
      ['Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136086208', 'CS / Engineering', 'Shelf C-3', 'Issued'],
      ['Operating System Concepts', 'Abraham Silberschatz', '978-1118063330', 'CS / Engineering', 'Shelf B-1', 'Available'],
      ['Business Psychology', 'Eugene McKenna', '978-1848721593', 'Management', 'Shelf D-2', 'Available'],
      ['Principles of Marketing', 'Philip Kotler', '978-0134492513', 'Management', 'Shelf D-5', 'Available'],
      ['Advanced Engineering Mathematics', 'Erwin Kreyszig', '978-0470458365', 'Mathematics', 'Shelf E-1', 'Available'],
      ['Introduction to Electrodynamics', 'David J. Griffiths', '978-0321856562', 'Physics', 'Shelf F-3', 'Available'],
      ['University Physics', 'Hugh D. Young', '978-0321973610', 'Physics', 'Shelf F-1', 'Available']
    ];

    const bookIds = [];
    for (const b of books) {
      const [res] = await connection.query(
        'INSERT INTO library_books (title, author, isbn, category, rack_location, status) VALUES (?, ?, ?, ?, ?, ?)',
        b
      );
      bookIds.push({ id: res.insertId, title: b[0], status: b[5] });
    }
    console.log(`Inserted ${bookIds.length} books.`);

    console.log('Inserting library members...');
    const members = [
      ['Emma Richardson', 'emma@student.com', 'student', 'Computer Science', 'Active'],
      ['James Chen', 'james@student.com', 'student', 'Software Engineering', 'Active'],
      ['Talha Khan', 'talha@gmail.com', 'student', 'Business Administration', 'Active'],
      ['Adeel Ahmad', 'adeel12@gmail.com', 'student', 'Electrical Engineering', 'Active'],
      ['Abid Ali', 'abid@gmail.com', 'student', 'Mathematics', 'Active']
    ];

    const memberIds = [];
    for (const m of members) {
      const [res] = await connection.query(
        'INSERT INTO library_members (name, email, role, department, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        m
      );
      memberIds.push({ id: res.insertId, name: m[0] });
    }
    console.log(`Inserted ${memberIds.length} library members.`);

    console.log('Inserting library transactions...');
    const today = new Date();
    
    // Transaction 1: Active issue (status = 'Issued')
    const issueDate1 = new Date(today);
    issueDate1.setDate(today.getDate() - 4);
    const dueDate1 = new Date(today);
    dueDate1.setDate(today.getDate() + 6);
    
    await connection.query(
      'INSERT INTO library_transactions (book_id, member_id, issue_date, due_date, status, fine_amount) VALUES (?, ?, ?, ?, ?, 0.00)',
      [bookIds[0].id, memberIds[0].id, issueDate1, dueDate1, 'Issued']
    );

    // Transaction 2: Overdue issue (status = 'Overdue', fine_amount = 150)
    const issueDate2 = new Date(today);
    issueDate2.setDate(today.getDate() - 20);
    const dueDate2 = new Date(today);
    dueDate2.setDate(today.getDate() - 6); // 6 days overdue!
    
    await connection.query(
      'INSERT INTO library_transactions (book_id, member_id, issue_date, due_date, status, fine_amount) VALUES (?, ?, ?, ?, ?, 150.00)',
      [bookIds[3].id, memberIds[1].id, issueDate2, dueDate2, 'Overdue']
    );

    // Transaction 3: Returned book
    const issueDate3 = new Date(today);
    issueDate3.setDate(today.getDate() - 10);
    const dueDate3 = new Date(today);
    dueDate3.setDate(today.getDate() - 2);
    const returnDate3 = new Date(today);
    returnDate3.setDate(today.getDate() - 3);
    
    await connection.query(
      'INSERT INTO library_transactions (book_id, member_id, issue_date, due_date, return_date, status, fine_amount) VALUES (?, ?, ?, ?, ?, ?, 0.00)',
      [bookIds[2].id, memberIds[2].id, issueDate3, dueDate3, returnDate3, 'Returned']
    );

    await connection.commit();
    console.log('Real library tables successfully seeded with gorgeous live transactions and assets!');
  } catch (error) {
    await connection.rollback();
    console.error('Real seeding error:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

run();
