const { pool } = require('../config/database');

async function check() {
    try {
        console.log("Checking BD tables...");
        const [tables] = await pool.query("SHOW TABLES LIKE 'bd_%'");
        console.table(tables);
        process.exit(0);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        process.exit(1);
    }
}

check();
