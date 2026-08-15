-- Create hub_memberships join table with composite PK
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS hub_memberships (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub_id uuid NOT NULL REFERENCES local_hubs(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, hub_id)
);
