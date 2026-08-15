-- Create local_hubs table
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS local_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location geography(Point,4326) NOT NULL,
  coverage_radius_km numeric NOT NULL DEFAULT 5,
  coordinator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
