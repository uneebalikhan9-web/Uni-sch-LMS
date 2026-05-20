const { pool } = require('../config/database');

async function run() {
  try {
    console.log("Creating course_reports table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`course_reports\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`course_id\` int NOT NULL,
        \`course_title\` varchar(255) NOT NULL,
        \`class_name\` varchar(255) NOT NULL,
        \`campus_id\` int DEFAULT NULL,
        \`campus_name\` varchar(255) DEFAULT NULL,
        \`teacher_id\` int DEFAULT NULL,
        \`teacher_name\` varchar(255) DEFAULT NULL,
        \`total_students\` int DEFAULT '0',
        \`avg_attendance\` decimal(5,2) DEFAULT '0.00',
        \`avg_marks\` decimal(5,2) DEFAULT '0.00',
        \`pass_count\` int DEFAULT '0',
        \`fail_count\` int DEFAULT '0',
        \`total_assignments\` int DEFAULT '0',
        \`completed_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`generated_by\` varchar(255) DEFAULT NULL,
        \`generated_by_role\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✅ course_reports table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

run();
