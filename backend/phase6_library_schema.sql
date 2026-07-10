USE lancersnexus_mastercore;

-- Library Books
CREATE TABLE IF NOT EXISTS library_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  rack_location VARCHAR(50) NOT NULL,
  status ENUM('Available', 'Issued', 'Reserved') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library Members
CREATE TABLE IF NOT EXISTS library_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Teacher', 'Staff') NOT NULL,
  department VARCHAR(100),
  status ENUM('Active', 'Suspended') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library Transactions
CREATE TABLE IF NOT EXISTS library_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  book_id INT NOT NULL,
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  return_date TIMESTAMP NULL,
  status ENUM('Issued', 'Returned', 'Overdue') DEFAULT 'Issued',
  fine_amount DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (member_id) REFERENCES library_members(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE
);
