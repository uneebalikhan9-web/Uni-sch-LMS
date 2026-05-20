const { pool } = require('../config/database');

async function run() {
  try {
    // Check if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admission_documents');
    console.log('Current document count:', rows[0].count);
    
    // Seed documents
    console.log('Seeding verification documents...');
    await pool.query(`
      INSERT INTO admission_documents (application_id, document_type, status, notes)
      VALUES 
      (3, 'Intermediate Transcript', 'pending', 'Awaiting transcript verification'),
      (3, 'Matric Certificate', 'verified', 'Verified with board'),
      (4, 'High School Diploma', 'pending', 'Requires IBCC equivalence'),
      (5, 'A-Level Result Card', 'verified', 'Grade sheet matched with Cambridge database'),
      (6, 'CNIC / Form-B Copy', 'pending', 'Needs physical copy matching'),
      (7, 'FSc Transcripts', 'verified', 'Final board verification complete')
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `);
    console.log('Documents seeded successfully!');
    
    const [logs] = await pool.query('SELECT COUNT(*) as count FROM admission_logs');
    if (logs[0].count === 0) {
      console.log('Seeding some audit logs...');
      await pool.query(`
        INSERT INTO admission_logs (action_type, action_text)
        VALUES
        ('VERIFICATION', 'Intermediate Transcript uploaded by Sophia Lee'),
        ('VERIFICATION', 'Matric Certificate verified for Sophia Lee'),
        ('SYSTEM', 'System aggregate calculated for Noah Anderson: 96.00%'),
        ('INTERVIEW', 'Interview scheduled for Liam Brown with Prof. Johnson')
      `);
      console.log('Logs seeded!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
