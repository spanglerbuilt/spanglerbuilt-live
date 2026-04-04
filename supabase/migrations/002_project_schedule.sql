-- Migration: 002_project_schedule.sql
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS project_schedule (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      text         NOT NULL,
  phase           text         NOT NULL,
  start_week      integer      NOT NULL DEFAULT 0,
  duration_weeks  integer      NOT NULL DEFAULT 1,
  color           text,
  created_at      timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_schedule_project_id ON project_schedule(project_id);

-- Function to seed default phases for a project
-- Call: SELECT seed_default_schedule('your-project-id');
CREATE OR REPLACE FUNCTION seed_default_schedule(p_id text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO project_schedule (project_id, phase, start_week, duration_weeks, color)
  VALUES
    (p_id, 'Demo & Site Prep',     0,  1, 'D06830'),
    (p_id, 'Rough Framing',        1,  2, 'FF8C00'),
    (p_id, 'MEP Rough-In',         2,  3, '185FA5'),
    (p_id, 'Inspections',          4,  1, '6C3483'),
    (p_id, 'Insulation & Drywall', 5,  2, '27ae60'),
    (p_id, 'Finishes & Tile',      6,  3, 'FF8C00'),
    (p_id, 'Fixtures & Trim',      8,  2, 'D06830'),
    (p_id, 'Punch List',           10, 1, '27ae60')
  ON CONFLICT DO NOTHING;
END;
$$;

-- RLS
ALTER TABLE project_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON project_schedule;
CREATE POLICY "service_role_all" ON project_schedule FOR ALL TO service_role USING (true);
