const { pool } = require('../config/database');

async function createTrainingsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS trainings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                instructor VARCHAR(100),
                start_date DATE,
                end_date DATE,
                image_url VARCHAR(255),
                status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        console.log('Creating trainings table...');
        await pool.query(query);
        console.log('✅ Trainings table created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating trainings table:', error);
    } finally {
        process.exit();
    }
}

createTrainingsTable();
