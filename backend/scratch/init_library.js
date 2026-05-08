const { pool } = require('../config/database');

async function initLibrary() {
  try {
    console.log('Initializing Library Database...');
    
    // 1. Books Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS library_books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        isbn VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        rack_location VARCHAR(50),
        status ENUM('Available', 'Issued', 'Reserved', 'Maintenance') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Members Table (Linking to users or separate)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS library_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50),
        department VARCHAR(100),
        status ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Transactions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS library_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT,
        member_id INT,
        issue_date DATE,
        due_date DATE,
        return_date DATE,
        fine_amount DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('Issued', 'Returned', 'Overdue') DEFAULT 'Issued',
        FOREIGN KEY (book_id) REFERENCES library_books(id),
        FOREIGN KEY (member_id) REFERENCES library_members(id)
      )
    `);

    console.log('Library tables created successfully!');
    
    // Seed some books if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM library_books');
    if (rows[0].count === 0) {
      console.log('Seeding initial library data...');
      await pool.query(`
        INSERT INTO library_books (title, author, isbn, category, rack_location) VALUES 
        ('Modern Operating Systems', 'Andrew S. Tanenbaum', '978-0133591620', 'Computer Science', 'A12'),
        ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'B04'),
        ('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Algorithms', 'A08'),
        ('The Lean Startup', 'Eric Ries', '978-0307887894', 'Entrepreneurship', 'C15')
      `);
      console.log('Seed books inserted.');
    }

  } catch (err) {
    console.error('Error initializing library:', err);
  } finally {
    process.exit();
  }
}

initLibrary();
