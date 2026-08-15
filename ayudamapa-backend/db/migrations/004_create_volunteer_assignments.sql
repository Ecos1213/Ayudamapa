-- Create volunteer_assignments table
SET search_path = resilio_schema, public;
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  pin_id uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','accepted','in_progress','completed','cancelled')),
  start_time timestamptz,
  end_time timestamptz,
  skills_offered jsonb,
  hours_committed numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
