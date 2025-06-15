CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20),
  password TEXT,
  profile_picture TEXT
);


CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  date DATE,
  time TIME,
  description TEXT,
  location VARCHAR(100),
  type VARCHAR(20), -- online / offline
  category VARCHAR(50),
  organizer VARCHAR(100)
);

INSERT INTO events (name, date, time, description, location, type, category, organizer) VALUES
('Tech Summit 2025', '2025-07-10', '10:00:00', 'Annual technology gathering', 'New York', 'offline', 'tech', 'TechCorp'),
('Live Music Fest', '2025-08-20', '18:00:00', 'Enjoy live performances from top bands.', 'Delhi', 'offline', 'music', 'Live Nation'),
('Virtual Wellness Workshop', '2025-07-15', '14:00:00', 'Interactive mental health session', 'Zoom', 'online', 'health', 'MindSpace');


-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL
);

-- Tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL
);


INSERT INTO events (name, date) VALUES
  ('Launch Party', '2025-07-01'),
  ('Annual Meetup', '2025-09-15'),
  ('Webinar', '2025-08-10');

INSERT INTO tickets (event_id, price, quantity) VALUES
  (1, 20.00, 100),
  (1, 20.00, 50),
  (2, 15.00, 200),
  (3, 10.00, 150);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,           -- full date and time
  event_date DATE GENERATED ALWAYS AS (start_time::date) STORED,  -- derived date
  mode VARCHAR(10) NOT NULL,               -- 'online' or 'offline'
  venue VARCHAR(255),
  banner_url VARCHAR(500),
  total_seats INTEGER NOT NULL DEFAULT 0,
  seats_booked INTEGER NOT NULL DEFAULT 0, -- new field to track booked seats
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  organizer VARCHAR(255),
  performer VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
