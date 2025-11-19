const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

// ---------------- ORGANIZER SIGNUP ----------------
router.post("/organizer/signup", (req, res) => {
    const { name, email, phone, password } = req.body;

    const q = `
        INSERT INTO Organizer (Name, Email, Phone_Number, Password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(q, [name, email, phone, password], (err, result) => {
        if (err) return res.status(400).json({ error: "Email already exists" });
        res.json({ message: "Organizer signup successful" });
    });
});

// ---------------- ATTENDEE SIGNUP ----------------
router.post("/attendee/signup", (req, res) => {
    const { name, email, phone, password } = req.body;

    const q = `
        INSERT INTO Attendees (Name, Email, Phone_Number, Password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(q, [name, email, phone, password], (err, result) => {
        if (err) return res.status(400).json({ error: "Email already exists" });
        res.json({ message: "Attendee signup successful" });
    });
});

// ---------------- ORGANIZER LOGIN ----------------
router.post("/organizer/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM Organizer WHERE Email=? AND Password=?",
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length === 0)
                return res.status(400).json({ error: "Invalid credentials" });

            const user = { ...results[0], userType: "organizer" };
            res.json({ message: "Organizer login successful", user });
        }
    );
});

// ---------------- ATTENDEE LOGIN ----------------
router.post("/attendee/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM Attendees WHERE Email=? AND Password=?",
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length === 0)
                return res.status(400).json({ error: "Invalid credentials" });

            const user = { ...results[0], userType: "attendee" };
            res.json({ message: "Attendee login successful", user });
        }
    );
});

module.exports = router;
