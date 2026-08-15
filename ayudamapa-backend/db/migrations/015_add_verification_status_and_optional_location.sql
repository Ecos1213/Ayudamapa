SET search_path = resilio_schema, public;
ALTER TABLE pins ALTER COLUMN location DROP NOT NULL;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pins_verification_status_check') THEN
    ALTER TABLE pins ADD CONSTRAINT pins_verification_status_check CHECK (verification_status IN ('unverified', 'verified'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_pins_verification_status ON pins (verification_status);
