const { pool } = require('./config/database');

async function findCampus() {
  try {
    const [campuses] = await pool.query('SELECT * FROM campuses');
    console.log('Campuses:', campuses);
    
    // Also check if there is a clients or tenants table
    const [tables] = await pool.query('SHOW TABLES LIKE "client%"');
    console.log('Client tables:', tables);
    
    if (tables.length > 0) {
      const tableName = Object.values(tables[0])[0];
      const [clients] = await pool.query(`SELECT * FROM ${tableName}`);
      console.log('Clients:', clients);
    }
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = "shaheryar@gmail.com" OR name LIKE "%shaheryar%"');
    console.log('Users matching shaheryar:', users.map(u => ({id: u.id, name: u.name, email: u.email, campus_id: u.campus_id, client_id: u.client_id})));
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
findCampus();
