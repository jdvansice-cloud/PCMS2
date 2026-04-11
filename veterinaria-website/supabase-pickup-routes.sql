-- Add pickup columns to web_bookings
ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS needs_pickup BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION;
ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION;
ALTER TABLE web_bookings ADD COLUMN IF NOT EXISTS pickup_address TEXT;

-- Routes table for admin route management
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_date DATE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Ruta del día',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route stops (ordered list of pickups in a route)
CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES web_bookings(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  estimated_time TEXT, -- HH:MM estimated arrival
  status TEXT NOT NULL DEFAULT 'pending' -- pending, picked_up, delivered
);

-- RLS policies
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access routes" ON routes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access route_stops" ON route_stops
  FOR ALL USING (auth.role() = 'authenticated');
