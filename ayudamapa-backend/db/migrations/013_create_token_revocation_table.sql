-- Create token_revocation table for tracking revoked JWT tokens
SET search_path = resilio_schema, public;

CREATE TABLE IF NOT EXISTS token_revocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jti text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES resilio_schema.users(id) ON DELETE CASCADE,
  revoked_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL
);

-- Create index on jti for fast lookup during token verification
CREATE INDEX IF NOT EXISTS idx_token_revocation_jti ON resilio_schema.token_revocation(jti);

-- Create index on user_id for bulk revocation by user
CREATE INDEX IF NOT EXISTS idx_token_revocation_user_id ON resilio_schema.token_revocation(user_id);

-- Create index on expires_at for cleanup of expired revocations
CREATE INDEX IF NOT EXISTS idx_token_revocation_expires_at ON resilio_schema.token_revocation(expires_at);

-- Add comment explaining the table
COMMENT ON TABLE resilio_schema.token_revocation IS 'Tracks revoked JWT tokens by JTI (JWT ID) to support token invalidation and logout';
COMMENT ON COLUMN resilio_schema.token_revocation.jti IS 'JWT ID - unique identifier for each token';
COMMENT ON COLUMN resilio_schema.token_revocation.user_id IS 'Reference to the user who owned the token';
COMMENT ON COLUMN resilio_schema.token_revocation.revoked_at IS 'Timestamp when token was revoked (usually at logout)';
COMMENT ON COLUMN resilio_schema.token_revocation.expires_at IS 'Timestamp when token would expire (cleanup after this time)';
