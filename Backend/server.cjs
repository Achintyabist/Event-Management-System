const express = require("express");
const cors = require("cors");

const authRoute = require("./routes/auth.cjs");
const eventRoute = require("./routes/event.cjs");
const registrationRoute = require("./routes/registration.cjs");
const venueRoute = require("./routes/venue.cjs");
const vendorsRoute = require("./routes/vendors.cjs");
const scheduleRoute = require("./routes/schedule.cjs");
const tasksRoute = require("./routes/tasks.cjs");
const budgetItemsRoute = require("./routes/budget_items.cjs");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);
app.use("/api/registrations", registrationRoute);
app.use("/api/venues", venueRoute);
app.use("/api/vendors", vendorsRoute);
app.use("/api/schedules", scheduleRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/budget-items", budgetItemsRoute);

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
