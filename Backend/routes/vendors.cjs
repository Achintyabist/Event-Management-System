const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// CREATE Vendor
router.post("/", (req, res) => {
  const { vendor_id, name, email, phone, service_type } = req.body;
  const q = "INSERT INTO Vendors (Vendor_Id, Name, Email, Phone_Number, Service_Type) VALUES (?, ?, ?, ?, ?)";
  db.query(q, [vendor_id, name, email, phone, service_type], (err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: "Vendor created successfully", id: vendor_id });
  });
});

// GET all Vendors
router.get("/", (req, res) => {
  db.query("SELECT * FROM Vendors", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

module.exports = router;
