SET search_path = resilio_schema, public;

ALTER TABLE pins ADD COLUMN IF NOT EXISTS record_kind text NOT NULL DEFAULT 'place';
ALTER TABLE pins ADD COLUMN IF NOT EXISTS place_type text;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS report_type text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pins_record_kind_check') THEN
    ALTER TABLE pins ADD CONSTRAINT pins_record_kind_check CHECK (record_kind IN ('place','report'));
  END IF;
END $$;

UPDATE pins
SET record_kind = CASE WHEN COALESCE(metadata->>'tipoReporte','') <> '' THEN 'report' ELSE 'place' END,
    place_type = CASE WHEN COALESCE(metadata->>'tipoReporte','') = '' THEN pin_type ELSE NULL END,
    report_type = NULLIF(metadata->>'tipoReporte','')
WHERE record_kind = 'place' AND (metadata ? 'tipoReporte' OR place_type IS NULL);

CREATE INDEX IF NOT EXISTS idx_pins_record_kind ON pins(record_kind);
CREATE INDEX IF NOT EXISTS idx_pins_place_type ON pins(place_type);
CREATE INDEX IF NOT EXISTS idx_pins_report_type ON pins(report_type);

UPDATE pins
SET report_type = 'dano_estructural'
WHERE report_type = 'daño_estructural';
