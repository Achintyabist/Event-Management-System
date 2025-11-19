const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// CREATE Task
router.post("/", (req, res) => {
  const { task_id, name, status, event_id, schedule_id } = req.body;
  const q = `INSERT INTO Tasks (Task_Id, Name, Status, Event_Id, Schedule_Id)
    VALUES (?, ?, ?, ?, ?)`;
  db.query(q, [task_id, name, status, event_id, schedule_id], (err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: "Task created successfully", id: task_id });
  });
});

// GET all Tasks
router.get("/", (req, res) => {
  db.query("SELECT * FROM Tasks", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

module.exports = router;
