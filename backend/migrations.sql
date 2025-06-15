-- users table
CREATE TABLE users(/* ... */);
-- events table
CREATE TABLE events(/* ... */);
-- attendees
CREATE TABLE attendees(/* ... */);
CREATE TABLE organizers (
  id SERIAL PRIMARY KEY,
  name TEXT, email TEXT UNIQUE, password TEXT, profile_picture TEXT
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER REFERENCES organizers(id),
  title TEXT, type TEXT, date DATE, time TIME, venue TEXT, platform TEXT, speakers TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  seat_label TEXT,
  status TEXT CHECK (status IN ('available','booked','cancelled'))
);

CREATE TABLE attendees (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER, seat_id INTEGER, booked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER,
  rating INTEGER,
  comment TEXT
);


CREATE TABLE organizers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  profile_picture TEXT
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER REFERENCES organizers(id),
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('online','offline')) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT,
  platform TEXT,
  speakers TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional tables for seats, attendees, feedback are omitted for brevity


CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  label VARCHAR(10) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'available'
);

INSERT INTO seats(event_id, seat_label, status)
SELECT 1, 'A' || generate_series(1,10), 'available'
UNION ALL
SELECT 1, 'B' || generate_series(1,10), 'available';


CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


INSERT INTO seats (event_id, seat_label, status)
SELECT 1, chr(65 + floor((generate_series - 1) / 10)) ||
  (1 + mod(generate_series - 1, 10)), 'available'
FROM generate_series(1, 50);
