-- Add password_hash column to users table for JWT authentication
SET search_path = resilio_schema, public;

-- Add password_hash column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Add comment explaining the column
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for authentication';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of the last successful login';
