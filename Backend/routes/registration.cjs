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

// DELETE /api/registrations/:id?attendeeId=...
router.delete("/:id", (req, res) => {
  const eventId = req.params.id;
  const { attendeeId } = req.query;

  if (!eventId || !attendeeId) {
    return res.status(400).json({ error: "Missing eventId or attendeeId" });
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
