const db = require('./Backend/db.cjs');

const name = "Test Organizer";
const email = "organizer" + Date.now() + "@test.com"; // Ensure unique email
const phone = "1234567890";
const password = "password123";

const q = `
    INSERT INTO Organizer (Name, Email, Phone_Number, Password)
    VALUES (?, ?, ?, ?)
`;

console.log("Attempting to insert organizer:", { name, email, phone, password });

db.query(q, [name, email, phone, password], (err, result) => {
    if (err) {
        console.error("❌ Signup Error:", err);
        process.exit(1);
    }
    console.log("✅ Organizer signup successful:", result);
    process.exit(0);
});
