const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalBooks }]] = await pool.query('SELECT COUNT(*) as totalBooks FROM library_books');
    const [[{ issuedBooks }]] = await pool.query('SELECT COUNT(*) as issuedBooks FROM library_books WHERE status = "Issued"');
    const [[{ members }]] = await pool.query('SELECT COUNT(*) as members FROM library_members');
    const [[{ overdue }]] = await pool.query('SELECT COUNT(*) as overdue FROM library_transactions WHERE status = "Overdue"');

    res.json({
      success: true,
      stats: { totalBooks, issuedBooks, members, overdue }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. BOOK CATALOG
// ==========================================
router.get('/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM library_books ORDER BY created_at DESC');
    res.json({ success: true, books: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. MEMBERS
// ==========================================
router.get('/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM library_members ORDER BY name ASC');
    res.json({ success: true, members: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. TRANSACTIONS (ISSUANCE)
// ==========================================
router.get('/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.title as book_title, m.name as member_name 
      FROM library_transactions t
      JOIN library_books b ON t.book_id = b.id
      JOIN library_members m ON t.member_id = m.id
      ORDER BY t.issue_date DESC
    `);
    res.json({ success: true, transactions: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4a. FINES
// ==========================================
router.get('/fines', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.title as book_title, m.name as member_name 
      FROM library_transactions t
      JOIN library_books b ON t.book_id = b.id
      JOIN library_members m ON t.member_id = m.id
      WHERE t.fine_amount > 0
      ORDER BY t.status ASC, t.due_date DESC
    `);
    res.json({ success: true, fines: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. ADD NEW BOOK
// ==========================================
router.post('/books', async (req, res) => {
  const { isbn, title, author, rack } = req.body;
  try {
    await pool.query(
      'INSERT INTO library_books (isbn, title, author, rack_location, status) VALUES (?, ?, ?, ?, "Available")',
      [isbn, title, author, rack]
    );
    res.json({ success: true, message: 'Book added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. REGISTER MEMBER
// ==========================================
router.post('/members', async (req, res) => {
  const { name, role, department } = req.body;
  try {
    await pool.query(
      'INSERT INTO library_members (name, role, department, status) VALUES (?, ?, ?, "Active")',
      [name, role, department]
    );
    res.json({ success: true, message: 'Member registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 7. ISSUE BOOK
// ==========================================
router.post('/issue', async (req, res) => {
  const { member_id, book_id, due_date } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create transaction
    await connection.query(
      'INSERT INTO library_transactions (member_id, book_id, due_date, status) VALUES (?, ?, ?, "Issued")',
      [member_id, book_id, due_date]
    );

    // 2. Update book status
    await connection.query('UPDATE library_books SET status = "Issued" WHERE id = ?', [book_id]);

    await connection.commit();
    res.json({ success: true, message: 'Book issued successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
