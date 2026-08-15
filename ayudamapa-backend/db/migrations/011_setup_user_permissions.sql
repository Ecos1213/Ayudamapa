-- Setup granular permissions for resilio_user and resilio_admin roles
-- resilio_user: SELECT, INSERT, UPDATE, DELETE on all objects in resilio_schema
-- resilio_admin: All permissions including CREATE TABLE, ALTER, DROP, CREATE VIEW

-- Create resilio_admin user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'resilio_admin') THEN
        CREATE ROLE resilio_admin WITH PASSWORD 'resilio_admin_dev' LOGIN;
    END IF;
END
$$;

-- Grant connection privileges on the database to both users
GRANT CONNECT ON DATABASE resilio TO resilio_user;
GRANT CONNECT ON DATABASE resilio TO resilio_admin;

-- ============================================================================
-- RESILIO_USER PERMISSIONS (SELECT, INSERT, UPDATE, DELETE only)
-- ============================================================================

-- Grant schema permissions
GRANT USAGE ON SCHEMA resilio_schema TO resilio_user;

-- Grant table-level DML permissions to resilio_user on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA resilio_schema TO resilio_user;

-- Grant sequence permissions (for auto-increment fields)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA resilio_schema TO resilio_user;

-- Set default privileges for resilio_user on future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA resilio_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO resilio_user;

-- Set default privileges for resilio_user on future sequences
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA resilio_schema
  GRANT USAGE, SELECT ON SEQUENCES TO resilio_user;

-- ============================================================================
-- RESILIO_ADMIN PERMISSIONS (All DML + DDL permissions)
-- ============================================================================

-- Grant schema permissions with CREATE privilege
GRANT USAGE, CREATE ON SCHEMA resilio_schema TO resilio_admin;

-- Grant all privileges on existing tables (includes SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA resilio_schema TO resilio_admin;

-- Grant all privileges on sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA resilio_schema TO resilio_admin;

-- Set default privileges for resilio_admin on future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA resilio_schema
  GRANT ALL PRIVILEGES ON TABLES TO resilio_admin;

-- Set default privileges for resilio_admin on future sequences
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA resilio_schema
  GRANT ALL PRIVILEGES ON SEQUENCES TO resilio_admin;

-- Grant privilege to create views (needed for CREATE VIEW privilege on schema)
-- Note: CREATE VIEW is implicitly granted with CREATE on schema
GRANT CREATE ON SCHEMA resilio_schema TO resilio_admin;
