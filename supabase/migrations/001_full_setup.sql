-- SpanglerBuilt Portal — Full Database Setup
-- Paste this entire block into Supabase SQL Editor and click Run
-- Safe to re-run: uses IF NOT EXISTS on tables, DROP/CREATE on policies

-- ── 1. PROJECTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number   text UNIQUE,
  client_name      text,
  client_email     text,
  project_type     text,
  address          text,
  budget_range     text,
  timeline         text,
  description      text,
  status           text DEFAULT 'new_lead',
  estimate_total   numeric,
  selected_tier    text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_client_email_idx ON projects (client_email);
CREATE INDEX IF NOT EXISTS projects_status_idx       ON projects (status);
CREATE INDEX IF NOT EXISTS projects_number_idx       ON projects (project_number);

-- ── 2. MESSAGES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid REFERENCES projects(id) ON DELETE CASCADE,
  sender_email text,
  sender_role  text,
  body         text,
  read         boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_project_id_idx ON messages (project_id);

-- ── 3. PROJECT ESTIMATES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_estimates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  tier             text,
  label            text,
  grand            numeric,
  direct           numeric,
  cont             numeric,
  op               numeric,
  tax              numeric,
  active_divisions jsonb,
  confirmed_at     timestamptz,
  updated_at       timestamptz DEFAULT now()
);

-- ── 4. PROJECT SELECTIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_selections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  selections   jsonb DEFAULT '{}',
  updated_at   timestamptz DEFAULT now()
);

-- ── 5. PROJECT OPTION PICKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_option_picks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  picks          jsonb DEFAULT '{}',
  upgrade_delta  numeric DEFAULT 0,
  updated_at     timestamptz DEFAULT now()
);

-- ── 6. PROJECT APPROVALS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_approvals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  approved     boolean DEFAULT false,
  approved_at  timestamptz,
  updated_at   timestamptz DEFAULT now()
);

-- ── 7. SCHEDULE TASKS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id       text,
  name          text,
  start_date    text,
  end_date      text,
  progress      numeric DEFAULT 0,
  dependencies  text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schedule_tasks_project_id_idx ON schedule_tasks (project_id);

-- ── 8. CATALOG MATERIALS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_materials (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category         text,
  subcategory      text,
  brand            text,
  product_name     text,
  style_type       text,
  size             text,
  finish           text,
  trim_style       text,
  unit             text DEFAULT 'EA',
  material_cost    numeric,
  labor_cost       numeric,
  total_installed  text,
  tier             text DEFAULT 'Good',
  photo_url        text,
  manufacturer_url text,
  supplier         text,
  description      text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (product_name, subcategory)
);

CREATE INDEX IF NOT EXISTS catalog_materials_category_idx ON catalog_materials (category);
CREATE INDEX IF NOT EXISTS catalog_materials_tier_idx     ON catalog_materials (tier);

-- ── 9. CATALOG VARIANTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id   uuid REFERENCES catalog_materials(id) ON DELETE CASCADE,
  variant_type  text,
  variant_name  text,
  price_delta   numeric DEFAULT 0,
  photo_url     text,
  in_stock      boolean DEFAULT true,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- ── 10. ROW LEVEL SECURITY ────────────────────────────────────────────────────
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_selections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_option_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_approvals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_materials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_variants     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_all" ON projects;
DROP POLICY IF EXISTS "service_all" ON messages;
DROP POLICY IF EXISTS "service_all" ON project_estimates;
DROP POLICY IF EXISTS "service_all" ON project_selections;
DROP POLICY IF EXISTS "service_all" ON project_option_picks;
DROP POLICY IF EXISTS "service_all" ON project_approvals;
DROP POLICY IF EXISTS "service_all" ON schedule_tasks;
DROP POLICY IF EXISTS "service_all" ON catalog_materials;
DROP POLICY IF EXISTS "service_all" ON catalog_variants;

CREATE POLICY "service_all" ON projects             FOR ALL USING (true);
CREATE POLICY "service_all" ON messages             FOR ALL USING (true);
CREATE POLICY "service_all" ON project_estimates    FOR ALL USING (true);
CREATE POLICY "service_all" ON project_selections   FOR ALL USING (true);
CREATE POLICY "service_all" ON project_option_picks FOR ALL USING (true);
CREATE POLICY "service_all" ON project_approvals    FOR ALL USING (true);
CREATE POLICY "service_all" ON schedule_tasks       FOR ALL USING (true);
CREATE POLICY "service_all" ON catalog_materials    FOR ALL USING (true);
CREATE POLICY "service_all" ON catalog_variants     FOR ALL USING (true);
