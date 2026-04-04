-- Migration: 005_marketing_tables.sql
-- Run in Supabase SQL editor

-- ── BRAND SETTINGS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_settings (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  key         text         UNIQUE NOT NULL,
  value       text,
  updated_by  text,
  updated_at  timestamptz  DEFAULT now()
);

INSERT INTO brand_settings (key, value) VALUES
  ('instagram_handle',     '@spanglerbuilt'),
  ('facebook_page',        'SpanglerBuilt'),
  ('tiktok_handle',        '@spanglerbuilt'),
  ('youtube_channel',      ''),
  ('google_business_url',  ''),
  ('hubspot_token',        ''),
  ('instagram_app_id',     ''),
  ('instagram_app_secret', ''),
  ('instagram_page_token', ''),
  ('facebook_app_id',      ''),
  ('facebook_app_secret',  ''),
  ('facebook_page_token',  ''),
  ('tiktok_client_key',    ''),
  ('tiktok_client_secret', ''),
  ('youtube_client_id',    ''),
  ('youtube_client_secret',''),
  ('google_client_id',     ''),
  ('google_client_secret', '')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON brand_settings;
CREATE POLICY "service_role_all" ON brand_settings FOR ALL TO service_role USING (true);

-- ── CAMPAIGNS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text,
  target_areas    text[],
  target_zip_codes text[],
  demographic     jsonb,
  project_types   text[],
  campaign_type   text,
  budget          numeric,
  budget_period   text         DEFAULT 'monthly',
  status          text         DEFAULT 'draft',
  ai_copy         jsonb,
  created_by      text,
  created_at      timestamptz  DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON campaigns;
CREATE POLICY "service_role_all" ON campaigns FOR ALL TO service_role USING (true);

-- ── SOCIAL POSTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_posts (
  id           uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url    text,
  title        text,
  caption      text,
  description  text,
  platforms    text[],
  scheduled_at timestamptz,
  status       text         DEFAULT 'scheduled',
  posted_by    text,
  created_at   timestamptz  DEFAULT now()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON social_posts;
CREATE POLICY "service_role_all" ON social_posts FOR ALL TO service_role USING (true);
