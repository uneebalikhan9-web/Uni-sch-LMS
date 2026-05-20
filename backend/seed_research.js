const { pool } = require('./config/database');

async function seed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS research_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        lead_pi VARCHAR(255),
        funding DECIMAL(15,2),
        duration VARCHAR(50),
        impact VARCHAR(50)
      )
    `);
    
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM research_projects');
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO research_projects (title, lead_pi, funding, duration, impact) VALUES 
        ('AI in Education Systems', 'Dr. Salman', 500000, '2 Years', 'High'),
        ('Quantum Computing Labs', 'Dr. Ahmed', 1200000, '3 Years', 'Global'),
        ('Sustainable Energy Grids', 'Prof. Raza', 750000, '1.5 Years', 'Medium')
      `);
      console.log('Research projects seeded');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

seed();
