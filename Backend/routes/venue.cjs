const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// CREATE Venue
router.post("/", (req, res) => {
  const { venue_id, name, location, capacity } = req.body;
  const q = "INSERT INTO Venue (Venue_Id, Name, Location, Capacity) VALUES (?, ?, ?, ?)";
  db.query(q, [venue_id, name, location, capacity], (err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: "Venue created successfully", id: venue_id });
  });
});

// GET all Venues
router.get("/", (req, res) => {
  db.query("SELECT * FROM Venue", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

module.exports = router;
