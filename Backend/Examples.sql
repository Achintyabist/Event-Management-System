1 List all events with their organizers

SELECT e.Event_Name, o.Name AS Organizer_Name, o.Email
FROM Event e
JOIN Organizer o ON e.Organizer_Id = o.Organizer_Id;

2 Show all sessions (schedules) with their venues and related event names

SELECT s.Session_Name, s.Session_Date, v.Name AS Venue_Name, e.Event_Name
FROM Schedule s
JOIN Venue v ON s.Venue_Id = v.Venue_Id
JOIN Event e ON s.Event_Id = e.Event_Id;

3 Find all tasks for each event along with the session they belong to

SELECT e.Event_Name, t.Name AS Task_Name, s.Session_Name, t.Status
FROM Tasks t
JOIN Event e ON t.Event_Id = e.Event_Id
JOIN Schedule s ON t.Schedule_Id = s.Schedule_Id;

4 Find vendors who provide services to more than one task
SELECT v.Name AS Vendor_Name, COUNT(DISTINCT b.Task_Id) AS Task_Count
FROM Vendors v
JOIN Budget_Items b ON v.Vendor_Id = b.Vendor_Id
GROUP BY v.Vendor_Id
HAVING COUNT(DISTINCT b.Task_Id) > 1;

5 Find venues that are hosting multiple sessions

SELECT v.Name AS Venue_Name, COUNT(s.Schedule_Id) AS Session_Count
FROM Venue v
JOIN Schedule s ON v.Venue_Id = s.Venue_Id
GROUP BY v.Venue_Id
HAVING COUNT(s.Schedule_Id) > 1;

6 Find all sessions happening on a particular date

SELECT Session_Name, Start_Time, End_Time, Venue_Id
FROM Schedule
WHERE Session_Date = '2025-12-30';