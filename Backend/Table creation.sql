CREATE DATABASE IF NOT EXISTS Event_Manager;
USE Event_Manager;
CREATE TABLE Organizer (
    Organizer_Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(20) NOT NULL, 
    Password VARCHAR(255) NOT NULL
);
CREATE TABLE Venue (
    Venue_Id INT PRIMARY KEY ,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(255) NOT NULL,
    Capacity INT NOT NULL
);


CREATE TABLE Vendors (
    Vendor_Id INT PRIMARY KEY ,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone_Number VARCHAR(20) NOT NULL ,
    Service_Type VARCHAR(100) NOT NULL
);


CREATE TABLE Attendees (
    Attendee_Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(20) NOT NULL UNIQUE,
    Password VARCHAR(255)
);


CREATE TABLE Event (
    Event_Id INT PRIMARY KEY,
    Event_Name VARCHAR(100) NOT NULL,
    Event_Description TEXT NOT NULL,
    Organizer_Id INT NOT NULL,
    
    CONSTRAINT fk_organizer_id_event FOREIGN KEY (Organizer_Id) REFERENCES Organizer(Organizer_Id)
);


CREATE TABLE Schedule (
    Schedule_Id INT PRIMARY KEY ,
    Event_Id INT NOT NULL,
    Session_Name VARCHAR(100) NOT NULL,
    Session_Date DATE NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL,
    Session_Organizer VARCHAR(50) NOT NULL,
    Venue_Id INT NOT NULL,
    
    CONSTRAINT fk_event_id_schedule FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
	CONSTRAINT fk_venue_id_schedule FOREIGN KEY (Venue_Id) REFERENCES Venue(Venue_Id) -- And add this line

);


CREATE TABLE Tasks (
    Task_Id INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Status VARCHAR(50) DEFAULT 'Pending', 
    Event_Id INT NOT NULL,
    Schedule_Id INT NOT NULL,  
    
    CONSTRAINT fk_event_id_tasks FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
    CONSTRAINT fk_schedule_id_tasks FOREIGN KEY (Schedule_Id) REFERENCES Schedule(Schedule_Id)
);


CREATE TABLE Budget_Items (
    Budget_Item_Id INT PRIMARY KEY,
    Task_Id INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Allocated_Amount DECIMAL(10, 2),
    Actual_Amount_Spent DECIMAL(10, 2),
    Vendor_Id INT  NOT NULL,

     CONSTRAINT fk_task_id_budget_items FOREIGN KEY (Task_Id) REFERENCES Tasks(Task_Id),
     CONSTRAINT fk_vendor_id_budget_items FOREIGN KEY (Vendor_Id) REFERENCES Vendors(Vendor_Id)
);


CREATE TABLE Registrations (
    Registration_Id INT PRIMARY KEY AUTO_INCREMENT,
    Attendee_Id INT NOT NULL,
    Schedule_Id INT NOT NULL, 
    Registration_Date DATE,
    
    CONSTRAINT fk_attendee_id_registrations FOREIGN KEY (Attendee_Id) REFERENCES Attendees(Attendee_Id),
    CONSTRAINT fk_schedule_id_registrations FOREIGN KEY (Schedule_Id) REFERENCES Schedule(Schedule_Id)
);

