const { pool } = require('../config/database');

async function resetData() {
  console.log('🚀 Starting Data Reset...');
  
  try {
    const connection = await pool.getConnection();
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log(`Found ${tableNames.length} tables.`);
    
    for (const tableName of tableNames) {
      if (tableName === 'users') {
        console.log(`🧹 Cleaning ${tableName} (keeping nexus.admin@lancerstech.com)...`);
        await connection.query("DELETE FROM users WHERE email != 'nexus.admin@lancerstech.com'");
        // Reset auto increment for users
        const [maxIdResult] = await connection.query('SELECT MAX(id) as maxId FROM users');
        const nextId = (maxIdResult[0].maxId || 0) + 1;
        await connection.query(`ALTER TABLE users AUTO_INCREMENT = ${nextId}`);
      } else if (tableName === 'campuses') {
        console.log(`🧹 Cleaning ${tableName} (keeping id 1)...`);
        await connection.query("DELETE FROM campuses WHERE id != 1");
        const [maxIdResult] = await connection.query('SELECT MAX(id) as maxId FROM campuses');
        const nextId = (maxIdResult[0].maxId || 0) + 1;
        await connection.query(`ALTER TABLE campuses AUTO_INCREMENT = ${nextId}`);
      } else {
        console.log(`🧨 Truncating ${tableName}...`);
        await connection.query(`TRUNCATE TABLE ${tableName}`);
      }
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    
    console.log('\n✨ Database reset complete! Only the Super Admin and Main Campus remain.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error resetting database:', error.message);
    process.exit(1);
  }
}

resetData();
