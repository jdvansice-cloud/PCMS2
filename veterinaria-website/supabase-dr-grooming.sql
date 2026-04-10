-- =============================================
-- Dr. Availability + Grooming Settings
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Dr. Availability (multiple time ranges per day)
CREATE TABLE IF NOT EXISTS dr_availability (
  id SERIAL PRIMARY KEY,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_available BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:30',
  slot_duration_minutes INT NOT NULL DEFAULT 60
);

-- Seed with same defaults as current business_hours
INSERT INTO dr_availability (day_of_week, is_available, start_time, end_time, slot_duration_minutes) VALUES
  (0, true,  '09:00', '17:30', 60),  -- Sunday
  (1, false, '09:00', '17:30', 60),  -- Monday (closed)
  (2, true,  '09:00', '17:30', 60),  -- Tuesday
  (3, true,  '09:00', '17:30', 60),  -- Wednesday
  (4, true,  '09:00', '17:30', 60),  -- Thursday
  (5, true,  '09:00', '17:30', 60),  -- Friday
  (6, true,  '09:00', '17:30', 60)   -- Saturday
ON CONFLICT DO NOTHING;

ALTER TABLE dr_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dr_availability" ON dr_availability FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert dr_availability" ON dr_availability FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update dr_availability" ON dr_availability FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete dr_availability" ON dr_availability FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Grooming Settings (daily capacity)
CREATE TABLE IF NOT EXISTS grooming_settings (
  id SERIAL PRIMARY KEY,
  max_daily_slots INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO grooming_settings (max_daily_slots) VALUES (5);

ALTER TABLE grooming_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read grooming_settings" ON grooming_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update grooming_settings" ON grooming_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Fix web_bookings: allow NULL booking_time for grooming
ALTER TABLE web_bookings ALTER COLUMN booking_time DROP NOT NULL;

-- 4. Drop the unique index that prevents multiple bookings at same date+time
--    (grooming bookings won't have a time, consults still checked via app logic)
DROP INDEX IF EXISTS idx_web_bookings_no_double_book;
