const { pool } = require('../config/database');

async function check() {
    try {
        console.log("Checking users table...");
        const [users] = await pool.query("DESCRIBE users");
        console.table(users);

        console.log("\nChecking employees table...");
        const [employees] = await pool.query("DESCRIBE employees");
        console.table(employees);

        console.log("\nTesting simple query...");
        const [res] = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log("Total users:", res[0].count);

        process.exit(0);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        process.exit(1);
    }
}

check();
