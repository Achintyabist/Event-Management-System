const express = require("express");
const db = require("../db.cjs");
const router = express.Router();

// CREATE Budget Item
router.post("/", (req, res) => {
  const { budget_item_id, task_id, name, allocated_amount, actual_amount_spent, vendor_id } = req.body;
  const q = `INSERT INTO Budget_Items (Budget_Item_Id, Task_Id, Name, Allocated_Amount, Actual_Amount_Spent, Vendor_Id)
    VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(q, [budget_item_id, task_id, name, allocated_amount, actual_amount_spent, vendor_id], (err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: "Budget item created successfully", id: budget_item_id });
  });
});

// GET all Budget Items
router.get("/", (req, res) => {
  db.query("SELECT * FROM Budget_Items", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

module.exports = router;
