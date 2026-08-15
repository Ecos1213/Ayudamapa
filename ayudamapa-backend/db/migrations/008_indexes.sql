-- Indexes for geospatial queries and common lookups
SET search_path = resilio_schema, public;

-- GIST index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_pins_location_gist ON pins USING GIST (location);

-- Useful search / filter indexes
CREATE INDEX IF NOT EXISTS idx_pins_type_status ON pins (pin_type, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
