-- =============================================
-- Veterinaria Vida+ Website Booking System
-- For PCMS2 Supabase — Run in SQL Editor
-- =============================================
-- NOTE: Does NOT modify existing PCMS2 tables.
-- Creates 3 new tables: web_bookings, business_hours, blocked_dates

-- 1. Business Hours (one row per day of the week)
CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INT NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '17:30',
  slot_duration_minutes INT NOT NULL DEFAULT 60
);

-- Seed: Monday closed, Tue-Sun 9AM-5:30PM
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time, slot_duration_minutes) VALUES
  (0, true,  '09:00', '17:30', 60),  -- Sunday
  (1, false, '09:00', '17:30', 60),  -- Monday (closed)
  (2, true,  '09:00', '17:30', 60),  -- Tuesday
  (3, true,  '09:00', '17:30', 60),  -- Wednesday
  (4, true,  '09:00', '17:30', 60),  -- Thursday
  (5, true,  '09:00', '17:30', 60),  -- Friday
  (6, true,  '09:00', '17:30', 60)   -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- 2. Blocked Dates (holidays, closures)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT
);

-- 3. Web Bookings (public website appointments, separate from PCMS appointments)
CREATE TABLE IF NOT EXISTS web_bookings (
  id SERIAL PRIMARY KEY,
  service TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent double-booking (same date+time unless cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_web_bookings_no_double_book
  ON web_bookings (booking_date, booking_time)
  WHERE status != 'cancelled';

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_bookings ENABLE ROW LEVEL SECURITY;

-- business_hours: anyone can read, authenticated can update
CREATE POLICY "Anyone can read business_hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Authenticated can update business_hours" ON business_hours FOR UPDATE USING (auth.role() = 'authenticated');

-- blocked_dates: anyone can read, authenticated can CRUD
CREATE POLICY "Anyone can read blocked_dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert blocked_dates" ON blocked_dates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete blocked_dates" ON blocked_dates FOR DELETE USING (auth.role() = 'authenticated');

-- web_bookings: anyone can insert + read (for availability check), authenticated has full access
CREATE POLICY "Anyone can insert web_bookings" ON web_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read web_bookings" ON web_bookings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update web_bookings" ON web_bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete web_bookings" ON web_bookings FOR DELETE USING (auth.role() = 'authenticated');
