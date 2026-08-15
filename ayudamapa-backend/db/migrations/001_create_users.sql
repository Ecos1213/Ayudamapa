-- Create users table
-- Create users table
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone_number text,
  display_name text,
  role text NOT NULL DEFAULT 'victim',
  language_preference text NOT NULL DEFAULT 'es',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
