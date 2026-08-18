const { pool } = require('./config/database');

async function alterTable() {
    try {
        await pool.query(`
            ALTER TABLE assignments ADD COLUMN external_link VARCHAR(1000) DEFAULT NULL;
        `);
        console.log("Column added successfully.");
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
            process.exit(0);
        } else {
            console.error("Error altering table:", e);
            process.exit(1);
        }
    }
}

alterTable();
