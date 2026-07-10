const { pool } = require('./config/database');
pool.query("SHOW TABLES LIKE 'finance_%'").then(([rows]) => {
    console.log('Tables:', rows.map(r => Object.values(r)[0]));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
