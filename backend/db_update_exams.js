const { pool } = require('./config/database');

async function updateDb() {
    try {
        console.log("Updating database schema...");

        // 1. Create exam_rooms table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                capacity INT NOT NULL,
                used INT DEFAULT 0,
                type VARCHAR(50) DEFAULT 'Examination Hall',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("exam_rooms table ensured.");

        // 2. Create exam_malpractice_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_malpractice_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                exam_id INT,
                incident_description TEXT NOT NULL,
                severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                status ENUM('Pending', 'Warning Issued', 'Resolved') DEFAULT 'Pending',
                incident_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
            )
        `);
        console.log("exam_malpractice_logs table ensured.");

        // 3. Seed some dummy exam rooms if empty
        const [roomRows] = await pool.query('SELECT COUNT(*) as count FROM exam_rooms');
        if (roomRows[0].count === 0) {
            await pool.query(`
                INSERT INTO exam_rooms (name, capacity, used, type) VALUES 
                ('Main Hall A', 200, 184, 'Examination Hall'),
                ('Library Floor 2', 120, 0, 'Quiet Zone'),
                ('Lab 04', 60, 58, 'Computer Lab'),
                ('Room 302', 40, 38, 'Classroom')
            `);
            console.log("Seeded exam_rooms table.");
        }

        // 4. Update the SQL schema file so it's persisted for new installations
        const fs = require('fs');
        let schema = fs.readFileSync('new_database_schema.sql', 'utf8');
        
        if (!schema.includes('CREATE TABLE `exam_rooms`')) {
            schema += `\n\n-- Exam Rooms\nCREATE TABLE \`exam_rooms\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`name\` varchar(100) NOT NULL,\n  \`capacity\` int(11) NOT NULL,\n  \`used\` int(11) DEFAULT 0,\n  \`type\` varchar(50) DEFAULT 'Examination Hall',\n  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`;
        }

        if (!schema.includes('CREATE TABLE `exam_malpractice_logs`')) {
            schema += `\n\n-- Exam Malpractice Logs\nCREATE TABLE \`exam_malpractice_logs\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`student_id\` int(11) NOT NULL,\n  \`exam_id\` int(11) DEFAULT NULL,\n  \`incident_description\` text NOT NULL,\n  \`severity\` enum('Low','Medium','High') DEFAULT 'Medium',\n  \`status\` enum('Pending','Warning Issued','Resolved') DEFAULT 'Pending',\n  \`incident_date\` date NOT NULL,\n  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),\n  PRIMARY KEY (\`id\`),\n  FOREIGN KEY (\`student_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,\n  FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\`(\`id\`) ON DELETE SET NULL\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`;
        }

        fs.writeFileSync('new_database_schema.sql', schema);
        console.log("Updated new_database_schema.sql successfully.");

        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

updateDb();
