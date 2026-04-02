-- project_estimates: contractor's finalized estimate snapshot per project
CREATE TABLE project_estimates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tier             TEXT NOT NULL,
  label            TEXT NOT NULL,
  grand            NUMERIC NOT NULL,
  direct           NUMERIC,
  cont             NUMERIC,
  op               NUMERIC,
  tax              NUMERIC,
  active_divisions JSONB,
  confirmed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id)
);

-- project_selections: client's material finish picks per project
CREATE TABLE project_selections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  selections  JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id)
);

-- project_option_picks: client's upgrade option picks per project
CREATE TABLE project_option_picks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  picks         JSONB NOT NULL DEFAULT '{}',
  upgrade_delta NUMERIC NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id)
);

-- project_approvals: client approval of selections per project
CREATE TABLE project_approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  approved    BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id)
);

-- RLS for new tables (service role bypasses RLS, so these only affect anon/authenticated)
ALTER TABLE project_estimates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_selections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_option_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_approvals    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contractor_all" ON project_estimates    FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON project_selections   FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON project_option_picks FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');
CREATE POLICY "contractor_all" ON project_approvals    FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');

CREATE POLICY "client_own" ON project_estimates    FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
CREATE POLICY "client_own" ON project_selections   FOR ALL   USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
CREATE POLICY "client_own" ON project_option_picks FOR ALL   USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
CREATE POLICY "client_own" ON project_approvals    FOR ALL   USING (project_id IN (SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'));
