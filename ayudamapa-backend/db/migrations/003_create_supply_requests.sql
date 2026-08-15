-- Create supply_requests table
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS supply_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  item_category text,
  item_name text,
  quantity_needed integer NOT NULL DEFAULT 0,
  quantity_fulfilled integer NOT NULL DEFAULT 0,
  unit text,
  urgency_level text CHECK (urgency_level IN ('low','medium','high','critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
