const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// POST /api/registrations
router.post("/", (req, res) => {
  const { attendee_id, event_id } = req.body;

  if (!attendee_id || !event_id) {
    return res.status(400).json({ error: "Missing attendee_id or event_id" });
  }

  // Step 1: find any schedule for this event
  const findSchedule = `
    SELECT Schedule_Id 
    FROM Schedule 
    WHERE Event_Id = ?
    ORDER BY Session_Date ASC
    LIMIT 1;
  `;

  db.query(findSchedule, [event_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });

    if (rows.length === 0) {
      return res.status(400).json({ error: "No schedule found for this event" });
    }

    const schedule_id = rows[0].Schedule_Id;

    // Step 2: register attendee for this schedule
    const insert = `
      INSERT INTO Registrations (Attendee_Id, Schedule_Id, Registration_Date)
      VALUES (?, ?, CURDATE());
    `;

    db.query(insert, [attendee_id, schedule_id], (err2, result) => {
      if (err2) return res.status(400).json({ error: err2.sqlMessage });

      return res.json({
        message: "Registration successful",
        registration_id: result.insertId,
        schedule_id,
      });
    });
  });
});

module.exports = router;
