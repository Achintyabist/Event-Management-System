/*
  # Create Event Management System Tables

  1. New Tables
    - `organizers`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `attendees`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, references organizers)
      - `title` (text)
      - `description` (text)
      - `event_date` (date)
      - `event_time` (time)
      - `location` (text)
      - `capacity` (integer)
      - `status` (text: 'upcoming', 'ongoing', 'completed')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `event_participants`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `attendee_id` (uuid, references attendees)
      - `registered_at` (timestamp)
      - `status` (text: 'registered', 'attended', 'cancelled')

  2. Security
    - Enable RLS on all tables
    - Add policies for organizers to manage their events
    - Add policies for attendees to view events and manage their registrations
*/

-- Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  location text,
  capacity integer DEFAULT 50,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id uuid NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  UNIQUE(event_id, attendee_id)
);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizers table
CREATE POLICY "Organizers can view their own profile"
  ON organizers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Organizers can update their own profile"
  ON organizers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create organizer profile"
  ON organizers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for attendees table
CREATE POLICY "Attendees can view their own profile"
  ON attendees FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Attendees can update their own profile"
  ON attendees FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create attendee profile"
  ON attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for events table
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizers WHERE organizers.id = auth.uid()
    ) AND organizer_id = auth.uid()
  );

CREATE POLICY "Organizers can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their own events"
  ON events FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());

-- RLS Policies for event_participants table
CREATE POLICY "Attendees can view their own registrations"
  ON event_participants FOR SELECT
  TO authenticated
  USING (attendee_id = auth.uid());

CREATE POLICY "Organizers can view participants for their events"
  ON event_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Attendees can register for events"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attendees WHERE attendees.id = auth.uid()
    ) AND attendee_id = auth.uid()
  );

CREATE POLICY "Attendees can cancel their own registrations"
  ON event_participants FOR UPDATE
  TO authenticated
  USING (attendee_id = auth.uid())
  WITH CHECK (attendee_id = auth.uid());

CREATE POLICY "Attendees can delete their own registrations"
  ON event_participants FOR DELETE
  TO authenticated
  USING (attendee_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_attendee_id ON event_participants(attendee_id);
