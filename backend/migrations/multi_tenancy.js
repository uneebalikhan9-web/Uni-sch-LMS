const { pool } = require('../config/database');

async function migrateMultiTenancy() {
  const connection = await pool.getConnection();
  try {
    console.log("Starting Multi-Tenancy DB Migration...");

    // 1. Check if client_id already exists in 'users'
    const [userCols] = await connection.query("SHOW COLUMNS FROM users LIKE 'client_id'");
    if (userCols.length === 0) {
      console.log("Adding client_id to users...");
      await connection.query("ALTER TABLE users ADD COLUMN client_id INT NULL");
      await connection.query("ALTER TABLE users ADD CONSTRAINT fk_user_client FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE");
    }

    // 2. Check if client_id already exists in 'campuses'
    const [campusCols] = await connection.query("SHOW COLUMNS FROM campuses LIKE 'client_id'");
    if (campusCols.length === 0) {
      console.log("Adding client_id to campuses...");
      await connection.query("ALTER TABLE campuses ADD COLUMN client_id INT NULL");
      await connection.query("ALTER TABLE campuses ADD CONSTRAINT fk_campus_client FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE");
    }

    // 3. Add to faculties
    const [facultyCols] = await connection.query("SHOW COLUMNS FROM faculties LIKE 'client_id'");
    if (facultyCols.length === 0) {
      console.log("Adding client_id to faculties...");
      await connection.query("ALTER TABLE faculties ADD COLUMN client_id INT NULL");
      await connection.query("ALTER TABLE faculties ADD CONSTRAINT fk_faculty_client FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE");
    }

    // 4. Add to departments
    const [deptCols] = await connection.query("SHOW COLUMNS FROM departments LIKE 'client_id'");
    if (deptCols.length === 0) {
      console.log("Adding client_id to departments...");
      await connection.query("ALTER TABLE departments ADD COLUMN client_id INT NULL");
      await connection.query("ALTER TABLE departments ADD CONSTRAINT fk_dept_client FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE");
    }

    // 5. Link existing data to the FIRST client (The original VC)
    // Find the original client (Lancers Nexus University)
    const [clients] = await connection.query("SELECT id FROM lancers_clients ORDER BY id ASC LIMIT 1");
    if (clients.length > 0) {
      const firstClientId = clients[0].id;
      console.log(`Linking existing data to Client ID: ${firstClientId}`);
      
      await connection.query("UPDATE users SET client_id = ? WHERE role != 'master_admin' AND client_id IS NULL", [firstClientId]);
      await connection.query("UPDATE campuses SET client_id = ? WHERE client_id IS NULL", [firstClientId]);
      await connection.query("UPDATE faculties SET client_id = ? WHERE client_id IS NULL", [firstClientId]);
      await connection.query("UPDATE departments SET client_id = ? WHERE client_id IS NULL", [firstClientId]);
    }

    console.log("Migration Complete! Multi-Tenancy Architecture is now active in the DB.");
  } catch (error) {
    console.error("Migration Failed:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateMultiTenancy();
