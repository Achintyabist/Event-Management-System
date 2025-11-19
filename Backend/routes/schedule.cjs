const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// CREATE Schedule
router.post("/", (req, res) => {
  console.log("DEBUG Create Session body:", req.body);  // ⭐ LOG INPUT

  const {
    session_name,
    session_date,
    start_time,
    end_time,
    venue_id,
    event_id
  } = req.body;

  if (
    !session_name ||
    !session_date ||
    !start_time ||
    !end_time ||
    !venue_id ||
    !event_id
  ) {
    console.log("❌ MISSING FIELD ERROR");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = `
    INSERT INTO Schedule 
    (Session_Name, Session_Date, Start_Time, End_Time, Venue_Id, Event_Id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    q,
    [session_name, session_date, start_time, end_time, venue_id, event_id],
    (err, result) => {
      if (err) {
        console.log("❌ SQL ERROR:", err.sqlMessage);  // ⭐ LOG SQL ERROR
        return res.status(400).json({ error: err.sqlMessage });
      }

      console.log("✔ Session Created:", result.insertId);
      res.json({ message: "Session created successfully", id: result.insertId });
    }
  );
});



// GET all Schedules
router.get("/", (req, res) => {
  db.query("SELECT * FROM Schedule", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

module.exports = router;
