-- Create pins table with PostGIS geography point
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  pin_type text NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  location geography(Point,4326) NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported','verified','in_progress','resolved')),
  description text,
  photo_url text,
  verified_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
