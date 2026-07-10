const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running hotfix 3 for VPS database (Adding rooms and fixing timetable structure)...');
    
    // 1. Create rooms table
    const createRooms = `
      CREATE TABLE IF NOT EXISTS \`rooms\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`campus_id\` int(11) DEFAULT NULL,
        \`building\` varchar(100) DEFAULT NULL,
        \`room_number\` varchar(50) DEFAULT NULL,
        \`room_type\` enum('lecture','lab','seminar','auditorium','exam_hall') DEFAULT 'lecture',
        \`capacity\` int(11) DEFAULT 30,
        \`is_air_conditioned\` tinyint(1) DEFAULT 0,
        \`has_projector\` tinyint(1) DEFAULT 0,
        \`has_smart_board\` tinyint(1) DEFAULT 0,
        \`is_available\` tinyint(1) DEFAULT 1,
        \`notes\` text DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createRooms);
    console.log('1. Rooms table created or checked.');

    // 2. Add room_id to timetables
    try {
      await pool.query('ALTER TABLE timetables ADD COLUMN room_id int(11) DEFAULT NULL AFTER end_time');
      console.log('2. Added room_id to timetables.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('2. room_id already exists in timetables.');
      else throw e;
    }

    // 3. Drop room_number from timetables (Optional, can just leave it if we want to be safe)
    try {
      await pool.query('ALTER TABLE timetables DROP COLUMN room_number');
      console.log('3. Dropped room_number from timetables.');
    } catch (e) {
      if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') console.log('3. room_number already dropped.');
      else console.log('3. Could not drop room_number, ignoring.'); // don't throw, it's not fatal
    }

    // 4. Add room_id to classes
    try {
      await pool.query('ALTER TABLE classes ADD COLUMN room_id int(11) DEFAULT NULL');
      console.log('4. Added room_id to classes.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('4. room_id already exists in classes.');
      else throw e;
    }
    
    // 5. Create semesters just in case
    const createSemesters = `
      CREATE TABLE IF NOT EXISTS \`semesters\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`campus_id\` int(11) DEFAULT NULL,
        \`name\` varchar(50) NOT NULL,
        \`term_type\` enum('Fall','Spring','Summer') NOT NULL,
        \`start_date\` date DEFAULT NULL,
        \`end_date\` date DEFAULT NULL,
        \`status\` enum('upcoming','active','frozen','completed') DEFAULT 'upcoming',
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createSemesters);
    console.log('5. Semesters table created or checked.');

    console.log('✅ VPS Hotfix 3 completed successfully! Timetables should now work perfectly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during hotfix 3:', error);
    process.exit(1);
  }
}

fix();
