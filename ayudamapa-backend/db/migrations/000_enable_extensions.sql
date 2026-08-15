-- Enable required extensions: pgcrypto for gen_random_uuid, postgis for geospatial types
-- Create resilio_user user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'resilio_user') THEN
        CREATE ROLE resilio_user WITH PASSWORD 'resilio_dev' LOGIN;
    END IF;
END
$$;

-- Enable required extensions at database level (before setting search_path)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ensure schema exists and assign ownership to resilio_user
CREATE SCHEMA IF NOT EXISTS resilio_schema;
ALTER SCHEMA resilio_schema OWNER TO resilio_user;

-- Grant privileges on schema to resilio_user
GRANT USAGE ON SCHEMA resilio_schema TO resilio_user;
GRANT CREATE ON SCHEMA resilio_schema TO resilio_user;

-- Set search path for subsequent operations
SET search_path = resilio_schema, public;
