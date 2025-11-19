const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// POST /api/registrations
router.post("/", (req, res) => {
  const { attendee_id, event_id, schedule_id } = req.body;

  if (!attendee_id) {
    return res.status(400).json({ error: "Missing attendee_id" });
  }

  // If schedule_id is provided, register directly
  if (schedule_id) {
    const insert = `
      INSERT INTO Registrations (Attendee_Id, Schedule_Id, Registration_Date)
      VALUES (?, ?, CURDATE());
    `;
    db.query(insert, [attendee_id, schedule_id], (err, result) => {
      if (err) return res.status(400).json({ error: err.sqlMessage });
      return res.json({
        message: "Registration successful",
        registration_id: result.insertId,
        schedule_id,
      });
    });
    return;
  }

  // No schedule_id provided - event-level registration not supported
  // Users must register for specific sessions
  return res.status(400).json({
    error: "schedule_id is required. Please register for specific sessions."
  });
});

// DELETE /api/registrations/:id?attendeeId=...&scheduleId=...
router.delete("/:id", (req, res) => {
  const eventId = req.params.id;
  const { attendeeId, scheduleId } = req.query;

  if (!eventId || !attendeeId) {
    return res.status(400).json({ error: "Missing eventId or attendeeId" });
  }

  // If scheduleId is provided, delete only that registration
  if (scheduleId) {
    const q = `
      DELETE FROM Registrations 
      WHERE Attendee_Id = ? 
      AND Schedule_Id = ?
    `;
    db.query(q, [attendeeId, scheduleId], (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.json({ message: "Unregistered from session successfully" });
    });
    return;
  }

  // Delete registrations for this attendee for all schedules of the given event
  const q = `
    DELETE FROM Registrations 
    WHERE Attendee_Id = ? 
    AND Schedule_Id IN (
      SELECT Schedule_Id FROM Schedule WHERE Event_Id = ?
    )
  `;

  db.query(q, [attendeeId, eventId], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json({ message: "Unregistered successfully" });
  });
});

module.exports = router;
