const { pool } = require('./config/database');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff_attendance (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              date DATE NOT NULL,
              status ENUM('Present', 'Absent', 'Leave', 'Late') DEFAULT 'Present',
              marked_by INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_daily_attendance (user_id, date)
            )
        `);
        console.log("staff_attendance table created successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Error creating table:", e);
        process.exit(1);
    }
}

createTable();
