-- Sample data for local development
SET search_path = resilio_schema, public;

-- Sample data for local development
INSERT INTO users (id, email, display_name, role) VALUES
  (gen_random_uuid(), 'alice@example.org', 'Alice', 'coordinator'),
  (gen_random_uuid(), 'bob@example.org', 'Bob', 'victim');

INSERT INTO pins (id, creator_id, pin_type, is_private, location, severity, status, description)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email='bob@example.org'),
  'damage',
  false,
  ST_SetSRID(ST_MakePoint(-74.0060,40.7128)::geometry,4326)::geography,
  'critical',
  'reported',
  'Collapsed road near central park.'
);
