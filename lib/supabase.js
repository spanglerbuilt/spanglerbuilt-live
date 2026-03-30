// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ============================================================
//  DATABASE SCHEMA — Run this SQL in Supabase SQL Editor
//  supabase.com → your project → SQL Editor → New query
// ============================================================

/*

-- PROFILES (extends NextAuth users)
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users PRIMARY KEY,
  role         TEXT NOT NULL DEFAULT 'client', -- 'contractor' or 'client'
  project_ids  UUID[] DEFAULT '{}',
  phone        TEXT,
  company      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number  TEXT UNIQUE NOT NULL,
  client_name     TEXT NOT NULL,
  client_email    TEXT NOT NULL,
  client_id       UUID REFERENCES profiles(id),
  project_type    TEXT NOT NULL,
  address         TEXT,
  sqft            TEXT,
  budget_range    TEXT,
  timeline        TEXT,
  description     TEXT,
  status          TEXT DEFAULT 'new_lead',
  drive_folder_url TEXT,
  estimate_total  NUMERIC,
  selected_tier   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SELECTIONS (client material selections)
CREATE TABLE selections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  category       TEXT NOT NULL,
  item_name      TEXT NOT NULL,
  tier           TEXT,
  product_name   TEXT,
  brand          TEXT,
  unit_price     NUMERIC,
  quantity       NUMERIC DEFAULT 1,
  total_cost     NUMERIC,
  allowance      NUMERIC DEFAULT 0,
  vendor         TEXT,
  sku            TEXT,
  mfr_link       TEXT,
  photo_url      TEXT,
  notes          TEXT,
  status         TEXT DEFAULT 'pending', -- pending, submitted, approved, locked
  submitted_at   TIMESTAMPTZ,
  approved_at    TIMESTAMPTZ,
  approved_by    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ESTIMATES (line items)
CREATE TABLE estimate_lines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  division_num TEXT NOT NULL,
  division_name TEXT NOT NULL,
  line_name    TEXT NOT NULL,
  quantity     NUMERIC DEFAULT 0,
  unit         TEXT,
  unit_rate    NUMERIC DEFAULT 0,
  mat_cost     NUMERIC DEFAULT 0,
  lab_cost     NUMERIC DEFAULT 0,
  total        NUMERIC GENERATED ALWAYS AS (mat_cost + lab_cost) STORED,
  tier_mult    NUMERIC DEFAULT 1.0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- CHANGE ORDERS
CREATE TABLE change_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  co_number    TEXT NOT NULL,
  description  TEXT NOT NULL,
  amount       NUMERIC NOT NULL,
  status       TEXT DEFAULT 'pending', -- pending, approved, rejected
  reason       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  approved_at  TIMESTAMPTZ
);

-- DOCUMENTS (contracts, proposals, PDFs)
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  type         TEXT NOT NULL, -- 'contract', 'proposal', 'change_order', 'invoice'
  title        TEXT NOT NULL,
  drive_url    TEXT,
  status       TEXT DEFAULT 'draft', -- draft, sent, signed
  signed_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (contractor ↔ client)
CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES profiles(id),
  sender_role  TEXT,
  body         TEXT NOT NULL,
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;

-- Contractors see everything
CREATE POLICY "contractor_all" ON projects       FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON selections     FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON estimate_lines FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON change_orders  FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON documents      FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON messages       FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');

-- Clients see only their own projects
CREATE POLICY "client_own_projects" ON projects
  FOR SELECT USING (client_email = auth.jwt()->>'email');
CREATE POLICY "client_own_selections" ON selections
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
CREATE POLICY "client_own_docs" ON documents
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
CREATE POLICY "client_own_messages" ON messages
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));

*/
