const db = require('./Backend/db.cjs');

db.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.error('Error fetching tables:', err);
        process.exit(1);
    }
    console.log('Tables in database:', results);
    process.exit(0);
});
