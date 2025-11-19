const db = require('./Backend/db.cjs');

db.query('DESCRIBE Organizer', (err, results) => {
    if (err) {
        console.error('Error describing table:', err);
        process.exit(1);
    }
    console.log('Organizer table schema:', results);
    process.exit(0);
});
