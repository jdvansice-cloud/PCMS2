-- Promo Settings for Veterinaria Vida+ Website
-- Run this in your PCMS2 Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promo_settings (
  id SERIAL PRIMARY KEY,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with one row (inactive by default)
INSERT INTO promo_settings (discount_percent, label, is_active)
VALUES (0, '', false)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE promo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read promo_settings" ON promo_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update promo_settings" ON promo_settings FOR UPDATE USING (auth.role() = 'authenticated');
