-- Create a simple migrations audit table
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS migrations_audit (
  id serial PRIMARY KEY,
  migration_name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
