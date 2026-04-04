-- Migration: 003_catalog_variants.sql
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS catalog_variants (
  id             uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id    uuid         REFERENCES catalog_materials(id) ON DELETE CASCADE,
  variant_type   text         NOT NULL,  -- 'style','size','finish','trim'
  variant_name   text         NOT NULL,  -- 'Shaker','2/0 x 6/8','Primed','No Trim'
  price_delta    numeric      DEFAULT 0, -- added to base price
  price_override numeric,                -- if set, replaces base price entirely
  in_stock       boolean      DEFAULT true,
  sort_order     integer      DEFAULT 0,
  created_at     timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_variants_material_id ON catalog_variants(material_id);

-- RLS
ALTER TABLE catalog_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON catalog_variants;
CREATE POLICY "service_role_all" ON catalog_variants FOR ALL TO service_role USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DEFAULT DOOR VARIANTS
-- Run this AFTER the table is created.
-- First: SELECT id, product_name FROM catalog_materials WHERE category ILIKE '%door%';
-- Then replace the UUIDs below with your actual door product IDs.
--
-- Example (replace 'YOUR-DOOR-MATERIAL-UUID-HERE' with real UUID):
-- ─────────────────────────────────────────────────────────────────────────────

-- CREATE OR REPLACE FUNCTION seed_door_variants(p_material_id uuid)
-- RETURNS void LANGUAGE plpgsql AS $$
-- BEGIN
--   INSERT INTO catalog_variants (material_id, variant_type, variant_name, price_delta, sort_order)
--   VALUES
--     -- STYLE
--     (p_material_id, 'style', 'Shaker',         0,    1),
--     (p_material_id, 'style', 'Craftsman',       45,   2),
--     (p_material_id, 'style', 'Flush',           0,    3),
--     (p_material_id, 'style', 'French (glass)',  120,  4),
--     (p_material_id, 'style', 'Barn',            95,   5),
--     -- SIZE
--     (p_material_id, 'size', '1/6 x 6/8',  -15,  1),
--     (p_material_id, 'size', '2/0 x 6/8',    0,  2),
--     (p_material_id, 'size', '2/4 x 6/8',    0,  3),
--     (p_material_id, 'size', '2/6 x 6/8',    0,  4),
--     (p_material_id, 'size', '2/8 x 6/8',   12,  5),
--     (p_material_id, 'size', '3/0 x 6/8',   18,  6),
--     (p_material_id, 'size', '2/0 x 8/0',   55,  7),
--     (p_material_id, 'size', '2/8 x 8/0',   68,  8),
--     (p_material_id, 'size', '3/0 x 8/0',   75,  9),
--     -- FINISH
--     (p_material_id, 'finish', 'Pre-hung Primed',   0,   1),
--     (p_material_id, 'finish', 'Pre-hung Stained',  35,  2),
--     (p_material_id, 'finish', 'Slab only',        -40,  3),
--     -- TRIM STYLE
--     (p_material_id, 'trim', 'No Trim',           0,   1),
--     (p_material_id, 'trim', 'Colonial Casing',   28,  2),
--     (p_material_id, 'trim', 'Craftsman Casing',  38,  3),
--     (p_material_id, 'trim', 'Shaker Casing',     42,  4)
--   ON CONFLICT DO NOTHING;
-- END;
-- $$;
--
-- To seed: SELECT seed_door_variants('YOUR-DOOR-MATERIAL-UUID-HERE');
