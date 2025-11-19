// db.cjs
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Kartikbruno@1234",   // your password (move to env in prod)
    database: "Event_Manager_new"
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

module.exports = db;
