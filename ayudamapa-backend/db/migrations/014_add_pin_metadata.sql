SET search_path = resilio_schema, public;

ALTER TABLE pins ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_pins_metadata_gin ON pins USING GIN (metadata);
