const { pool } = require('./config/database'); pool.query('SELECT id, client_name FROM lancers_clients WHERE client_name LIKE "%punjab%"').then(([rows]) => { console.log(rows); process.exit(0); });
