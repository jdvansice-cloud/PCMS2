-- Add source column to track where the appointment was created
ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'online';
