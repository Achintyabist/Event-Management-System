// registration.cjs
const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// POST /api/registrations
// body: { attendee_id, schedule_id }
router.post("/", (req, res) => {
  const { attendee_id, event_id } = req.body;
  if (!attendee_id || !event_id) return res.status(400).json({ error: "Missing fields" });

  const q = `
    INSERT INTO Registrations (Attendee_Id, Event_Id, Registration_Date)
    VALUES (?, ?, CURDATE())
  `;
  db.query(q, [attendee_id, event_id], (err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: "Registration successful", id: result.insertId });
  });
});

module.exports = router;
