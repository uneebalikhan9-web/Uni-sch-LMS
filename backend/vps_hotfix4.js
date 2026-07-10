const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running hotfix 4 for VPS database (Adding missing Finance tables)...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS \`finance_student_challans\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`student_id\` int(11) NOT NULL,
        \`challan_no\` varchar(50) NOT NULL UNIQUE,
        \`tuition_fee\` decimal(12,2) DEFAULT 0,
        \`lab_fee\` decimal(12,2) DEFAULT 0,
        \`library_fee\` decimal(12,2) DEFAULT 0,
        \`other_fee\` decimal(12,2) DEFAULT 0,
        \`total_amount\` decimal(12,2) NOT NULL,
        \`due_date\` date DEFAULT NULL,
        \`paid_date\` date DEFAULT NULL,
        \`status\` enum('unpaid','paid','overdue','pending','waived') DEFAULT 'pending',
        \`semester_id\` int(11) DEFAULT NULL,
        \`academic_year\` varchar(20) DEFAULT NULL,
        \`notes\` text DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`reminder_count\` int(11) DEFAULT 0,
        \`last_reminder_at\` datetime DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`finance_payroll\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`employee_id\` int(11) NOT NULL,
        \`month\` varchar(20) NOT NULL,
        \`year\` int(11) NOT NULL,
        \`basic_salary\` decimal(12,2) NOT NULL,
        \`bonus\` decimal(12,2) DEFAULT 0.00,
        \`deductions\` decimal(12,2) DEFAULT 0.00,
        \`net_payable\` decimal(12,2) NOT NULL,
        \`status\` enum('pending','disbursed','held') DEFAULT 'pending',
        \`disbursed_at\` timestamp NULL DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`finance_expenses\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`category\` varchar(100) DEFAULT 'other',
        \`amount\` decimal(12,2) NOT NULL,
        \`expense_date\` date DEFAULT NULL,
        \`description\` text DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`added_by\` int(11) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS \`finance_fee_structures\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`program_id\` INT NOT NULL,
        \`semester_id\` INT NOT NULL,
        \`fee_type\` VARCHAR(255) NOT NULL,
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`campus_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS \`finance_scholarship_types\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`discount_percentage\` DECIMAL(5,2) NOT NULL,
        \`campus_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS \`finance_student_scholarships\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`student_id\` INT NOT NULL,
        \`scholarship_id\` INT NOT NULL,
        \`semester_id\` INT DEFAULT NULL,
        \`status\` ENUM('active', 'revoked', 'expired') DEFAULT 'active',
        \`campus_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (let i = 0; i < tables.length; i++) {
      await pool.query(tables[i]);
      console.log(`Checked/Created finance table ${i + 1}/${tables.length}`);
    }

    console.log('✅ VPS Hotfix 4 completed successfully! Finance module is now ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during hotfix 4:', error);
    process.exit(1);
  }
}

fix();
