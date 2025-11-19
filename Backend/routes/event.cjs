const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

/*
=========================================================
              GET ALL EVENTS
=========================================================
*/
router.get("/", (req, res) => {
  const { type, attendeeId } = req.query;

  // ------------------- Registered Events (via Schedule) -------------------
  if (type === "registered" && attendeeId) {
    const q = `
      SELECT 
        e.Event_Id,
        e.Event_Name,
        e.Event_Description,
        e.Organizer_Id,

        -- Total participants for this event
        (
          SELECT COUNT(DISTINCT r2.Attendee_Id)
          FROM Registrations r2
          JOIN Schedule s2 ON r2.Schedule_Id = s2.Schedule_Id
          WHERE s2.Event_Id = e.Event_Id
        ) AS participants

      FROM Event e
      WHERE e.Event_Id IN (
        SELECT s.Event_Id
        FROM Schedule s
        JOIN Registrations r ON r.Schedule_Id = s.Schedule_Id
        WHERE r.Attendee_Id = ?
      );
    `;

    db.query(q, [attendeeId], (err, results) => {
      if (err) {
        console.error("Registered events SQL Error:", err.sqlMessage);
        return res.status(500).json({ error: err.sqlMessage });
      }
      return res.json(results);
    });
    return;
  }

  // ------------------- All Events -------------------
  // ------------------- All Events -------------------
  let q2 = `
    SELECT 
      e.Event_Id,
      e.Event_Name,
      e.Event_Description,
      e.Organizer_Id,
      (
        SELECT COUNT(DISTINCT r.Attendee_Id)
        FROM Registrations r
        JOIN Schedule s ON r.Schedule_Id = s.Schedule_Id
        WHERE s.Event_Id = e.Event_Id
      ) AS participants
    FROM Event e
  `;

  if (req.query.hasSessions === 'true') {
    q2 += ` WHERE EXISTS (SELECT 1 FROM Schedule s WHERE s.Event_Id = e.Event_Id) `;
  }

  q2 += ` GROUP BY e.Event_Id;`;

  db.query(q2, (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
});

/*
=========================================================
              GET EVENT BY ID
=========================================================
*/
router.get("/:id", (req, res) => {
  const eventId = req.params.id;

  const q = `
      SELECT e.*, o.Name AS Organizer_Name 
      FROM Event e
      LEFT JOIN Organizer o ON e.Organizer_Id = o.Organizer_Id
      WHERE e.Event_Id = ?
    `;

  db.query(q, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });

    if (results.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(results[0]);
  });
});

// ------------------ GET SCHEDULES OF AN EVENT ------------------ //
router.get("/:id/schedules", (req, res) => {
  const eventId = req.params.id;
  const { attendeeId } = req.query;

  const q = `
    SELECT 
      s.Schedule_Id, s.Session_Name, s.Session_Date, 
      s.Start_Time, s.End_Time, s.Venue_Id, s.Session_Organizer,
      v.Name AS Venue_Name, v.Location AS Venue_Location,
      
      (SELECT COUNT(*) FROM Registrations r WHERE r.Schedule_Id = s.Schedule_Id) AS registered_count,
      
      (SELECT COUNT(*) > 0 
       FROM Registrations r 
       WHERE r.Schedule_Id = s.Schedule_Id AND r.Attendee_Id = ?) AS is_registered

    FROM Schedule s
    JOIN Venue v ON s.Venue_Id = v.Venue_Id
    WHERE s.Event_Id = ?
  `;

  // Pass attendeeId (or null/0 if undefined) and eventId
  db.query(q, [attendeeId || 0, eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(results);
  });
});
/*
=========================================================
              GET ATTENDEES OF EVENT
=========================================================
*/
router.get('/:id/attendees', (req, res) => {
  const eventId = req.params.id;

  const q = `
    SELECT DISTINCT a.Attendee_Id, a.Name, a.Email
    FROM Attendees a
    JOIN Registrations r ON a.Attendee_Id = r.Attendee_Id
    JOIN Schedule s ON s.Schedule_Id = r.Schedule_Id
    WHERE s.Event_Id = ?
    GROUP BY a.Attendee_Id
  `;

  db.query(q, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(results);
  });
});




/*
=========================================================
              CREATE EVENT
=========================================================
*/
router.post("/", (req, res) => {
  const { event_name, event_description, organizer_id } = req.body;

  console.log("DEBUG Create Event body:", req.body);  // ADD THIS

  if (!event_name || !event_description || !organizer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "INSERT INTO Event (Event_Name, Event_Description, Organizer_Id) VALUES (?, ?, ?)",
    [event_name, event_description, organizer_id],
    (err, result) => {
      if (err) {
        console.log("CREATE EVENT SQL ERROR:", err.sqlMessage);  // ADD THIS
        return res.status(400).json({ error: err.sqlMessage });  // Return readable message
      }
      return res.json({ message: "Event created successfully", id: result.insertId });
    }
  );
});


/*
=========================================================
              UPDATE EVENT
=========================================================
*/
router.put("/:id", (req, res) => {
  const eventId = req.params.id;
  const {
    event_name,
    event_description,
    event_date,
    event_time,
    venue_id,
    vendor_id,
    organizer_id,
  } = req.body;

  const updateFields = [];
  const updateValues = [];

  if (event_name !== undefined) {
    updateFields.push("Event_Name = ?");
    updateValues.push(event_name);
  }
  if (event_description !== undefined) {
    updateFields.push("Event_Description = ?");
    updateValues.push(event_description);
  }
  if (event_date !== undefined) {
    updateFields.push("Event_Date = ?");
    updateValues.push(event_date);
  }
  if (event_time !== undefined) {
    updateFields.push("Event_Time = ?");
    updateValues.push(event_time);
  }
  if (venue_id !== undefined) {
    updateFields.push("Venue_Id = ?");
    updateValues.push(venue_id);
  }
  if (vendor_id !== undefined) {
    updateFields.push("Vendor_Id = ?");
    updateValues.push(vendor_id);
  }
  if (organizer_id !== undefined) {
    updateFields.push("Organizer_Id = ?");
    updateValues.push(organizer_id);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const query = `UPDATE Event SET ${updateFields.join(", ")} WHERE Event_Id = ?`;
  updateValues.push(eventId);

  db.query(query, updateValues, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Event not found" });

    return res.json({ message: "Event updated successfully" });
  });
});

/*
=========================================================
              DELETE EVENT
=========================================================
*/
router.delete("/:id", (req, res) => {
  const eventId = req.params.id;

  // Step 1: Delete registrations for all schedules of this event
  const deleteRegistrations = `
    DELETE FROM Registrations 
    WHERE Schedule_Id IN (
      SELECT Schedule_Id FROM Schedule WHERE Event_Id = ?
    )
  `;

  db.query(deleteRegistrations, [eventId], (err1) => {
    if (err1) return res.status(500).json({ error: err1.sqlMessage });

    // Step 2: Delete budget items for all tasks of this event
    const deleteBudgetItems = `
      DELETE FROM Budget_Items 
      WHERE Task_Id IN (
        SELECT Task_Id FROM Tasks WHERE Event_Id = ?
      )
    `;

    db.query(deleteBudgetItems, [eventId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.sqlMessage });

      // Step 3: Delete tasks for this event
      const deleteTasks = `DELETE FROM Tasks WHERE Event_Id = ?`;

      db.query(deleteTasks, [eventId], (err3) => {
        if (err3) return res.status(500).json({ error: err3.sqlMessage });

        // Step 4: Delete schedules for this event
        const deleteSchedules = `DELETE FROM Schedule WHERE Event_Id = ?`;

        db.query(deleteSchedules, [eventId], (err4) => {
          if (err4) return res.status(500).json({ error: err4.sqlMessage });

          // Step 5: Finally, delete the event itself
          db.query("DELETE FROM Event WHERE Event_Id = ?", [eventId], (err5, result) => {
            if (err5) return res.status(500).json({ error: err5.sqlMessage });

            if (result.affectedRows === 0)
              return res.status(404).json({ error: "Event not found" });

            return res.json({ message: "Event and all related data deleted successfully" });
          });
        });
      });
    });
  });
});

module.exports = router;
