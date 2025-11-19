const fs = require('fs');
const path = require('path');
const db = require('./Backend/db.cjs');

const sqlPath = path.join(__dirname, 'Database', 'Table creation.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Remove the CREATE DATABASE and USE lines since we are already connected to the DB
// and we want to run the table creations.
// Splitting by semicolon to run queries one by one is a simple approach.
const queries = sql
    .replace(/CREATE DATABASE IF NOT EXISTS Event_Manager_new;/g, '')
    .replace(/USE Event_Manager_new;/g, '')
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

function runQueries(queries) {
    if (queries.length === 0) {
        console.log('All queries executed successfully.');
        process.exit(0);
    }

    const query = queries.shift();
    console.log('Running query:', query.substring(0, 50) + '...');

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            // Don't exit on error, maybe some tables exist? 
            // Actually for now let's fail fast to see the error.
            process.exit(1);
        }
        runQueries(queries);
    });
}

runQueries(queries);
