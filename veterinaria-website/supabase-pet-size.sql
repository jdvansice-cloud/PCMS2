-- Add pet_size column to web_bookings
-- Run in Supabase SQL Editor

ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS pet_size TEXT;
