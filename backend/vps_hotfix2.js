const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running hotfix 2 for VPS database to add missing tables (timetables, logs, etc)...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS \`timetables\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`class_id\` int(11) DEFAULT NULL,
        \`course_id\` int(11) NOT NULL,
        \`teacher_id\` int(11) NOT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`day_of_week\` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
        \`start_time\` time NOT NULL,
        \`end_time\` time NOT NULL,
        \`room_number\` varchar(100) DEFAULT NULL,
        \`academic_year\` varchar(20) DEFAULT '2024-2025',
        \`semester\` varchar(20) DEFAULT 'Fall',
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`system_logs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`action\` varchar(255) NOT NULL,
        \`module\` varchar(100) DEFAULT NULL,
        \`details\` text DEFAULT NULL,
        \`ip_address\` varchar(50) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`action\` varchar(255) NOT NULL,
        \`module\` varchar(100) DEFAULT NULL,
        \`details\` text DEFAULT NULL,
        \`ip_address\` varchar(50) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`chat_messages\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`sender_id\` int(11) NOT NULL,
        \`receiver_id\` int(11) NOT NULL,
        \`message\` text NOT NULL,
        \`read_at\` timestamp NULL DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS \`course_reports\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`course_id\` int(11) NOT NULL,
        \`teacher_id\` int(11) NOT NULL,
        \`report_name\` varchar(255) NOT NULL,
        \`file_path\` varchar(500) DEFAULT NULL,
        \`completed_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS \`institutional_kpis\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`metric_name\` varchar(255) NOT NULL,
        \`metric_value\` decimal(15,2) DEFAULT 0.00,
        \`category\` enum('enrollment','revenue','academic','retention') DEFAULT 'academic',
        \`campus_id\` int(11) DEFAULT NULL,
        \`recorded_at\` date NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (let i = 0; i < tables.length; i++) {
      await pool.query(tables[i]);
      console.log(`Checked/Created table ${i + 1}/${tables.length}`);
    }

    console.log('✅ VPS Hotfix 2 completed successfully! Timetables and Logs are now available.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during hotfix 2:', error);
    process.exit(1);
  }
}

fix();
