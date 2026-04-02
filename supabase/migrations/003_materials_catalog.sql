-- ============================================================
-- 003_materials_catalog.sql
-- SpanglerBuilt Materials Catalog
-- Covers all allowance line items for basement renovations,
-- kitchen remodels, bathroom remodels, and home additions
-- in the metro Atlanta, GA market.
--
-- Price ranges are material-only (no labor) in USD as of 2025-2026.
-- ============================================================


-- ============================================================
-- SCHEMA
-- ============================================================

CREATE TABLE materials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  category        TEXT        NOT NULL,  -- e.g. 'interior_doors', 'lvp_flooring'
  subcategory     TEXT,                  -- e.g. 'barn_door', 'pocket_door'
  project_types   TEXT[]      NOT NULL DEFAULT '{}',
  -- values: 'basement', 'kitchen', 'bathroom', 'addition'

  -- Tier / price level
  tier            TEXT        NOT NULL,
  -- values: 'good', 'better', 'best', 'luxury'

  -- Identity
  name            TEXT        NOT NULL,  -- Product line / series name
  brand           TEXT,                  -- Manufacturer / brand
  sku             TEXT,                  -- Manufacturer SKU or model # if known
  description     TEXT,                  -- Short display description

  -- Specs
  dimensions      TEXT,                  -- e.g. '30"×80"', '12"×24"'
  unit            TEXT        NOT NULL DEFAULT 'each',
  -- common values: 'each', 'sq_ft', 'lin_ft', 'set'

  -- Pricing (material only, Atlanta metro, 2025-2026)
  price_low       NUMERIC     NOT NULL,  -- Low end of range
  price_high      NUMERIC     NOT NULL,  -- High end of range
  price_note      TEXT,                  -- Any clarifying note on pricing

  -- Display / catalog
  finish_options  TEXT[],                -- Available finish colors/materials
  image_url       TEXT,                  -- Optional product image
  spec_url        TEXT,                  -- Link to spec sheet / product page
  notes           TEXT,                  -- Contractor-facing notes
  active          BOOLEAN     NOT NULL DEFAULT true,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table: ties a client's material pick to a project
CREATE TABLE project_material_picks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  material_id     UUID        NOT NULL REFERENCES materials(id),
  category        TEXT        NOT NULL,  -- denormalized for fast filtering
  quantity        NUMERIC     NOT NULL DEFAULT 1,
  unit            TEXT        NOT NULL DEFAULT 'each',
  price_confirmed NUMERIC,               -- the price locked in at time of pick
  client_note     TEXT,
  contractor_note TEXT,
  picked_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, category)           -- one pick per category per project
);

-- Indexes for catalog page filtering
CREATE INDEX idx_materials_category    ON materials(category);
CREATE INDEX idx_materials_tier        ON materials(tier);
CREATE INDEX idx_materials_project_types ON materials USING GIN(project_types);
CREATE INDEX idx_materials_active      ON materials(active) WHERE active = true;

-- Indexes for junction table
CREATE INDEX idx_picks_project_id      ON project_material_picks(project_id);
CREATE INDEX idx_picks_material_id     ON project_material_picks(material_id);

-- RLS
ALTER TABLE materials               ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_picks  ENABLE ROW LEVEL SECURITY;

-- Contractor: full access to catalog and all picks
CREATE POLICY "contractor_all" ON materials
  FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');

CREATE POLICY "contractor_all" ON project_material_picks
  FOR ALL USING (auth.jwt()->>'email' = 'michael@spanglerbuilt.com');

-- Clients: read the catalog, manage only their own picks
CREATE POLICY "client_read_catalog" ON materials
  FOR SELECT USING (active = true);

CREATE POLICY "client_own_picks" ON project_material_picks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE client_email = auth.jwt()->>'email'
    )
  );

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER picks_updated_at
  BEFORE UPDATE ON project_material_picks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- SEED DATA
-- ============================================================
-- All prices: material only (no labor), Atlanta metro 2025-2026.
-- Price unit matches the "unit" column:
--   'each'   → per door / unit / fixture
--   'sq_ft'  → per square foot
--   'lin_ft' → per linear foot of cabinet run
--   'set'    → per accessory set
-- ============================================================


-- ============================================================
-- 1. INTERIOR DOORS
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

-- GOOD tier — Hollow Core, Pre-hung
('interior_doors','hollow_core_prehung','{"basement","bathroom","addition"}','good',
 'RELIABILT 2-Panel Smooth Hollow Core','RELIABILT / Lowe''s',
 '2-panel smooth molded hollow-core pre-hung interior door; MDF skin over cardboard core',
 '30"×80"','each',89,139,
 'Includes split jamb; add ~$20 for 32" or 36"',
 '{"Primed white"}',
 'Stock at Lowe''s. Best value for closets and non-primary rooms.'),

('interior_doors','hollow_core_prehung','{"basement","bathroom","addition"}','good',
 'RELIABILT 6-Panel Hollow Core','RELIABILT / Lowe''s',
 '6-panel colonial smooth hollow-core pre-hung; the most common builder-grade door style',
 '30"×80"','each',99,149,
 'Prices increase ~$15 per inch of width above 30"',
 '{"Primed white"}',
 'Stock at Lowe''s. Standard builder grade.'),

('interior_doors','hollow_core_prehung','{"basement","bathroom","addition"}','good',
 'Masonite Smooth 2-Panel Hollow Core Pre-hung','Masonite',
 'Smooth-face hollow-core pre-hung door; step up from RELIABILT in fit/finish',
 '28"–36"×80"','each',109,169,NULL,
 '{"Primed white"}',
 'Available Home Depot and Lowe''s.'),

-- BETTER tier — Solid Core, Pre-hung
('interior_doors','solid_core_prehung','{"basement","bathroom","addition","kitchen"}','better',
 'Masonite Smooth 2-Panel Solid Core Pre-hung','Masonite',
 'Solid wood composite core; significantly better sound isolation than hollow core',
 '30"×80"','each',219,319,
 'Common sizes (28–36") at Home Depot/Lowe''s; 48" double unit ~$450–$600',
 '{"Primed white"}',
 'Recommended for primary bathrooms, offices, and home additions.'),

('interior_doors','solid_core_prehung','{"basement","bathroom","addition","kitchen"}','better',
 'Steves & Sons 5-Panel Shaker Solid Core Pre-hung','Steves & Sons',
 '5-panel shaker style with solid MDF/LVL core; popular transitional look',
 '30"×80"','each',249,369,NULL,
 '{"Primed white"}',
 'Available Home Depot. Very popular for remodels matching shaker cabinetry.'),

('interior_doors','solid_core_prehung','{"basement","bathroom","addition","kitchen"}','better',
 'RELIABILT 3-Panel Equal Shaker Solid Core Pre-hung','RELIABILT / Lowe''s',
 '3-panel shaker door; engineered stile and rail with solid core',
 '30"–36"×80"','each',229,329,NULL,
 '{"Primed white"}',
 'Stock Lowe''s. Pairs well with shaker vanities and cabinets.'),

-- BEST tier — Barn Doors, Pocket, French
('interior_doors','barn_door','{"basement","bathroom","kitchen","addition"}','best',
 'Masonite Lincoln Park 1-Panel Barn Door Kit','Masonite',
 'Solid composite 1-panel flat barn door with hardware kit; saves swing clearance',
 '36"×84"','each',299,429,
 'Kit includes door + sliding hardware; 42" and 48" widths available',
 '{"Primed white","Rustic Java"}',
 'Good for bathrooms where swing clearance is tight.'),

('interior_doors','barn_door','{"basement","bathroom","kitchen","addition"}','best',
 'Steves & Sons Shaker Barn Door with Hardware','Steves & Sons',
 'Shaker-style solid-core barn door with matte black hardware kit',
 '36"×80"','each',379,499,NULL,
 '{"Primed white"}',
 'Available Home Depot. Matte black hardware is the current preferred finish.'),

('interior_doors','french_door','{"basement","addition","kitchen"}','best',
 'Steves & Sons Interior French Door Pair (Glass)','Steves & Sons',
 'Pair of interior French doors with clear or rain glass; pre-hung double unit',
 '48"×80" (pair)','each',649,949,
 'Price is for the pre-hung double unit; glass style affects price',
 '{"Primed white"}',
 'Used for home office, den separations. Very popular in additions.'),

('interior_doors','pocket_door','{"bathroom","basement"}','best',
 'Johnson Hardware Pocket Door Frame + Slab Kit','Johnson Hardware',
 'Steel pocket door frame kit with hollow or solid core slab; space-saving for tight baths',
 '32"×80"','each',289,429,
 'Frame kit + slab; does not include drywall or paint. Solid core slab add ~$80.',
 '{"Primed white (slab)"}',
 'Rough-in must be 2× the door width. Budget extra for drywall patching.'),

-- LUXURY tier — Custom / Solid Wood
('interior_doors','solid_core_prehung','{"addition","basement","kitchen","bathroom"}','luxury',
 'TruStile TS Series Solid MDF Custom Door','TruStile',
 'Fully custom solid MDF core in any TruStile panel profile; precision tolerances',
 'Custom (up to 42"×96")','each',650,1200,
 'Material only; excludes hardware and jamb set',
 '{"Primed white","Painted (any color)"}',
 'Lead time 4–6 weeks. Used on high-end remodels where profiles must match millwork.'),

('interior_doors','solid_core_prehung','{"addition","basement","kitchen","bathroom"}','luxury',
 'Simpson Door Co. Clear Pine Solid Wood Pre-hung','Simpson Door',
 'FSC-certified solid clear pine; paintable or stainable; heirloom quality',
 '30"–42"×84"','each',750,1500,
 'Includes finger-jointed pine jamb; add 15% for wider/taller openings',
 '{"Unfinished pine (stainable or paintable)"}',
 'For clients wanting real wood grain through paint or stain.');


-- ============================================================
-- 2. EGRESS WINDOWS
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('egress_windows','casement','{"basement"}','good',
 'RELIABILT 2700 Series Casement Egress Window','RELIABILT / Lowe''s',
 'Vinyl casement egress window; meets IRC §R310 egress code (min 5.7 sq ft opening); Low-E glass',
 '29-1/2"×47-1/2" RO (28"×46" glass)','each',285,365,
 'Window unit only; excludes well, well cover, and installation',
 '{"White vinyl"}',
 'Minimum IRC egress: 20" wide × 24" tall, 5.7 sq ft net opening. Verify local code.'),

('egress_windows','casement','{"basement"}','good',
 'JELD-WEN V-2500 Vinyl Casement Egress Window','JELD-WEN',
 'Vinyl casement; budget-friendly; available in standard egress sizes',
 '29-1/2"×47-1/2" RO','each',320,420,NULL,
 '{"White vinyl"}',
 'Widely available at Home Depot. Decent warranty.'),

('egress_windows','casement','{"basement"}','better',
 'Andersen 400 Series Casement Egress Window','Andersen',
 'Clad-wood casement (Fibrex exterior, pine interior); superior insulation and fit',
 '29-9/16"×54-9/16" RO (CW135)','each',549,729,
 'Unit only; pine interior is paintable/stainable',
 '{"White","Sandtone","Terratone"}',
 'Step up in quality that clients notice. Low-E4 glass standard.'),

('egress_windows','casement','{"basement"}','better',
 'Pella 250 Series Casement Egress Window','Pella',
 'Vinyl casement with between-the-glass blinds option; strong energy performance',
 '29-1/2"×47-1/2" RO','each',479,649,NULL,
 '{"White","Black"}',
 'Good mid-range option with optional built-in blinds (add ~$80).'),

('egress_windows','window_well','{"basement"}','good',
 'Bilco ScapeWEL Steel Window Well','Bilco',
 'Galvanized steel egress window well; corrugated design with drainage hole',
 'Fits up to 48" wide window','each',149,229,
 'Cover sold separately (~$79–$120)',
 '{"Galvanized steel"}',
 'Most common well brand. Must be anchored to foundation per code.'),

('egress_windows','window_well','{"basement"}','better',
 'Bilco ScapeWEL Polycarbonate Cover (fits Bilco well)','Bilco',
 'Clear or translucent polycarbonate hinged cover; allows light, keeps debris and water out',
 'Fits 48"–64" wells','each',79,139,NULL,
 '{"Clear polycarbonate"}',
 'Code in many jurisdictions requires well cover to be openable from inside.'),

('egress_windows','window_well','{"basement"}','better',
 'Shape Products Polypropylene Window Well','Shape Products',
 'Ribbed plastic window well; lighter than steel, rust-proof, UV stabilized',
 '48"×36" (W×projection)','each',119,199,NULL,
 '{"Sandstone","White"}',
 'Good alternative to Bilco steel. Available at Home Depot.'),

('egress_windows','casement','{"basement"}','best',
 'Andersen 400 Series Casement + Bilco ScapeWEL Package (material only)','Andersen / Bilco',
 'Andersen 400 Series casement window + Bilco steel well + polycarbonate cover; full material package',
 '29-9/16"×54-9/16" window + 48" well','each',749,999,
 'Package price (3 components); excludes cutting, waterproofing, and backfill',
 '{"White Andersen / Galvanized well"}',
 'Quote this as one line item for the allowance. Labor to cut and waterproof is separate.'),

('egress_windows','casement','{"basement"}','luxury',
 'Marvin Elevate Casement Egress Window (Clad-Wood)','Marvin',
 'Fiberglass-clad casement; Ultrex exterior won''t peel, fade, or rust; luxury interior finish',
 'Custom sizes to 36"×60"','each',950,1450,
 'Lead time 3–5 weeks for custom sizes',
 '{"White","Black","Bronze","Ebony"}',
 'Best-in-class window for high-end basement finishes. Strong warranty.');


-- ============================================================
-- 3. LVP / HARDWOOD FLOORING  (priced per sq ft, material only)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

-- LVP — GOOD
('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','good',
 'LifeProof Essential LVP','LifeProof / Home Depot',
 '6 mil wear layer, waterproof rigid core, attached underlayment; click-lock floating',
 '6"×36", 4–6mm','sq_ft',2.09,3.29,
 'Home Depot exclusive; price per sq ft before waste factor (add 10%)',
 '{"Multiple neutrals"}',
 'Good baseline for basements and rentals.'),

('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','good',
 'TrafficMASTER Locking LVP','TrafficMASTER / Home Depot',
 'Budget LVP with 6 mil wear layer; water-resistant (not fully waterproof core)',
 '6"×36", 4mm','sq_ft',1.49,2.29,NULL,
 '{"Oak tones, gray tones"}',
 'Lowest cost option. Suitable for basements with confirmed no moisture issues.'),

-- LVP — BETTER
('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','better',
 'Shaw Floorte Pro 5 Series LVP','Shaw',
 '12 mil wear layer, ScratchGuard Pro, waterproof rigid SPC core, attached underlayment',
 '7"×48", 5mm','sq_ft',3.19,4.49,
 'Available at Floor & Decor and flooring dealers; prices vary by color',
 '{"30+ colorways"}',
 'Shaw''s workhorse mid-tier. Great warranty (limited lifetime residential).'),

('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','better',
 'COREtec Plus Enhanced Plank LVP','COREtec / US Floors',
 'Patented cork underlayment, 12 mil wear layer, waterproof inorganic core; quieter underfoot',
 '7"×48", 6mm','sq_ft',3.79,5.29,
 'Widely available at Floor & Decor, Carpet One, flooring dealers',
 '{"Wide color range"}',
 'The cork underlayment is a real differentiator for comfort in finished basements.'),

('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','better',
 'Pergo Extreme LVP','Pergo / Mohawk',
 'WetProtect waterproof core + subfloor, 12 mil wear layer; Pergo brand recognition',
 '7.48"×47.24", 6mm','sq_ft',3.49,4.99,NULL,
 '{"20+ colorways"}',
 'Strong brand; available Home Depot and flooring dealers.'),

-- LVP — BEST
('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','best',
 'COREtec Pro Plus Enhanced LVP','COREtec',
 '20 mil wear layer, 8mm SPC core, attached cork underlayment; commercial-grade durability',
 '9"×60", 8mm','sq_ft',4.99,6.99,
 'Pro series available at specialty dealers and Floor & Decor',
 '{"Premium wood looks"}',
 '20 mil wear layer is essentially indestructible for residential use.'),

('lvp_flooring','lvp','{"basement","addition","kitchen","bathroom"}','best',
 'Shaw Floorte Pro 7 Series LVP (Wide Plank)','Shaw',
 'Premium wide-plank LVP; 20 mil wear layer, ScratchGuard, waterproof',
 '9"×72", 8mm','sq_ft',4.49,6.49,NULL,
 '{"Premium wood looks"}',
 'Wide plank format looks more like real hardwood.'),

-- ENGINEERED HARDWOOD — BETTER
('lvp_flooring','engineered_hardwood','{"addition","kitchen","basement"}','better',
 'Bruce Engineered Hardwood — American Vintage Collection','Bruce / Armstrong',
 'Hand-scraped engineered hardwood; 3/8" thick with real hardwood veneer',
 '5"×47", 3/8" thick','sq_ft',4.29,6.49,
 'Material only; requires acclimation and professional install (glue or nail)',
 '{"Hickory","Oak","Maple — multiple stains"}',
 'Good entry-level engineered hardwood. Cannot be floated in basements; glue down.'),

('lvp_flooring','engineered_hardwood','{"addition","kitchen"}','better',
 'Shaw Repel Engineered Hardwood','Shaw',
 'Water-resistant coating on engineered hardwood; real wood top layer; floating or glue',
 '5"×48", 1/2" thick','sq_ft',4.99,7.49,NULL,
 '{"Oak — 10+ stains"}',
 'The water-resistant finish is a good selling point for clients worried about spills.'),

-- ENGINEERED HARDWOOD — BEST
('lvp_flooring','engineered_hardwood','{"addition","kitchen"}','best',
 'Anderson Tuftex Hardwood — Bernina Collection','Anderson Tuftex / Shaw',
 'Wide-plank engineered hardwood; wire-brushed European Oak; premium visual depth',
 '6.25"×86", 1/2" thick','sq_ft',7.49,11.99,
 'Available at specialty dealers and Georgia Carpet / Floor & Decor',
 '{"European Oak — 8 colorways"}',
 'Anderson Tuftex is Shaw''s luxury sub-brand. Excellent craftsmanship.'),

('lvp_flooring','engineered_hardwood','{"addition","kitchen"}','best',
 'Provenza Hardwood — Heirloom Collection (Wire-brushed Oak)','Provenza',
 'European Oak engineered; heavy wire-brush texture, wide plank, rustic character',
 '7.5"×74", 9/16" thick','sq_ft',8.99,13.49,NULL,
 '{"European Oak — multiple smoky/warm tones"}',
 'Very popular in kitchen remodels with a farmhouse or transitional aesthetic.'),

-- ENGINEERED HARDWOOD — LUXURY
('lvp_flooring','engineered_hardwood','{"addition","kitchen"}','luxury',
 'Hakwood Brave Collection Engineered Oak','Hakwood',
 'Dutch-engineered European Oak; 6mm real wood top layer, 20+ year finish warranty; FSC',
 '7.5"×86", 5/8" thick','sq_ft',14.00,22.00,
 'Import; typically ordered through specialty showrooms; 3–6 week lead',
 '{"Multiple curated European Oak tones"}',
 'True luxury tier. Used on high-end kitchen and addition projects.'),

('lvp_flooring','engineered_hardwood','{"addition","kitchen"}','luxury',
 'Legno Bastone Chevron/Herringbone European Oak','Legno Bastone',
 'Premium Italian-engineered hardwood; custom chevron or herringbone layout; stunning visual',
 '3"×18" (herringbone plank)','sq_ft',18.00,32.00,
 'Pattern layout; price does not include the significant additional labor for pattern install',
 '{"Unfinished or pre-finished in custom stains"}',
 'Reserve for luxury kitchen or addition projects with design-forward clients.');


-- ============================================================
-- 4. BATHROOM FLOOR TILE  (per sq ft, material only)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('bathroom_floor_tile','ceramic','{"bathroom"}','good',
 'Daltile Restore Ceramic Floor Tile','Daltile',
 'Matte-finish rectified ceramic; scratch-resistant; residential/light commercial',
 '12"×24"','sq_ft',1.79,2.99,
 'Available Home Depot and Daltile showrooms; price varies by color',
 '{"White","Almond","Gray","Taupe"}',
 'Budget bathroom floor. Works well in small bathrooms.'),

('bathroom_floor_tile','ceramic','{"bathroom"}','good',
 'MS International (MSI) Baja Matte Ceramic','MSI',
 'Matte ceramic tile; rectified edges; easy DIY-friendly format',
 '12"×12"','sq_ft',1.29,2.29,NULL,
 '{"White","Gray","Beige"}',
 'Good entry-level. Available at Floor & Decor and MSI dealers.'),

('bathroom_floor_tile','porcelain','{"bathroom"}','better',
 'Daltile Chord Matte Porcelain Floor Tile','Daltile',
 'Through-body porcelain; rectified; matte finish (good slip resistance); contemporary look',
 '12"×24"','sq_ft',2.99,4.49,
 'R11 slip-resistance rating for wet areas',
 '{"Ivory","Greige","Charcoal","Warm Gray"}',
 'A workhorse for bathroom floors. Very popular neutral tones.'),

('bathroom_floor_tile','porcelain','{"bathroom"}','better',
 'Florida Tile Home Collection Porcelain','Florida Tile',
 'Rectified matte porcelain; consistent dimensions for tight grout joints',
 '12"×24"','sq_ft',2.49,3.99,NULL,
 '{"Concrete looks, stone looks, neutral tones"}',
 'Florida Tile has a strong presence in Atlanta. Good quality for the price.'),

('bathroom_floor_tile','porcelain','{"bathroom"}','better',
 'MSI Calacatta Marbella Porcelain (Marble-look)','MSI',
 'Rectified matte-finish porcelain with Calacatta marble veining; no maintenance of real stone',
 '12"×24"','sq_ft',3.49,5.29,
 'Available at Floor & Decor',
 '{"White with gray veining"}',
 'Extremely popular. Gives marble look without marble maintenance.'),

('bathroom_floor_tile','porcelain','{"bathroom"}','best',
 'Porcelanosa RODANO Porcelain Floor Tile','Porcelanosa',
 'Large-format rectified porcelain; slim 9mm profile; Spanish manufacture; premium quality',
 '24"×24"','sq_ft',8.99,14.99,
 'Available Porcelanosa Atlanta showroom; larger formats available up to 24×48',
 '{"Caliza (warm gray)","Antracita (charcoal)","Nature (beige)"}',
 'Significant step up. Used on primary bathroom floors with high-end budgets.'),

('bathroom_floor_tile','porcelain','{"bathroom"}','best',
 'Daltile Perpetuo Large Format Porcelain','Daltile',
 'Premium rectified large-format porcelain; full-body color; very low water absorption',
 '24"×24" or 24"×48"','sq_ft',5.49,8.99,NULL,
 '{"Light Gray","Mid Gray","Warm Beige"}',
 'Best-tier from Daltile. Available through Daltile showrooms.'),

('bathroom_floor_tile','natural_stone','{"bathroom"}','best',
 'MSI Carrara White Marble Mosaic (Polished)','MSI',
 '2"×2" polished Carrara marble mosaic on mesh; classic high-end look',
 '12"×12" mesh sheet','sq_ft',9.99,14.99,
 'Sealing required before and periodically after install',
 '{"Carrara white with gray veining"}',
 'Use on primary bathroom floors only; coach clients on sealing and etching.'),

('bathroom_floor_tile','natural_stone','{"bathroom"}','luxury',
 'Waterworks Studio Stone — Honed Marble or Travertine','Waterworks',
 'Designer-curated natural stone; honed finish; imported from Italy/Turkey; custom fabrication',
 '12"×12" to 24"×24"','sq_ft',18.00,35.00,
 'Available Waterworks Atlanta showroom; lead time varies',
 '{"Bianco Carrara","Crema Marfil","Silver Travertine"}',
 'Reserve for luxury primary bathrooms. Coach on maintenance requirements.'),

('bathroom_floor_tile','natural_stone','{"bathroom"}','luxury',
 'Artistic Tile Quartzite (Super White or Taj Mahal)','Artistic Tile',
 'Bookmatched quartzite tile; harder than marble; dramatic veining; prestige material',
 '12"×24" to 24"×48"','sq_ft',22.00,45.00,
 'Available Artistic Tile Atlanta; varies significantly by slab lot',
 '{"Super White","Taj Mahal","Sea Pearl"}',
 'Hardest natural stone used in bathrooms. Requires professional sealing.');


-- ============================================================
-- 5. SHOWER WALL TILE  (per sq ft, material only)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('shower_wall_tile','subway','{"bathroom"}','good',
 'Daltile Restore Bright White Ceramic Subway','Daltile',
 'Classic glossy white ceramic subway tile; the most popular shower wall tile in remodeling',
 '3"×6"','sq_ft',1.49,2.49,
 'Available Home Depot; 4×12 version also available ~$0.30/sf more',
 '{"Bright White"}',
 'Budget shower tile that still looks clean and classic.'),

('shower_wall_tile','subway','{"bathroom"}','good',
 'MSI Bright White Beveled Ceramic Subway','MSI',
 'Glossy white beveled-edge ceramic subway; beveled edge adds shadow line detail',
 '3"×6"','sq_ft',1.79,2.79,NULL,
 '{"Bright White"}',
 'Floor & Decor. Beveled edge is a low-cost upgrade over flat subway.'),

('shower_wall_tile','subway','{"bathroom"}','better',
 'Daltile Rittenhouse Square Ceramic Subway (Color Body)','Daltile',
 'Color-body ceramic subway in 20+ colors; clean fired edge; timeless classic',
 '3"×6" or 4"×12"','sq_ft',2.29,3.99,
 '4×12 format commands slight premium; widely available at Daltile showrooms',
 '{"Arctic White","Matte Grey","Almond","Biscuit","Urban Putty","Lagoon + 15 more"}',
 'Daltile''s most popular shower wall tile. Great color selection.'),

('shower_wall_tile','porcelain','{"bathroom"}','better',
 'MSI Retro White Glossy Porcelain Subway','MSI',
 'Porcelain subway (harder, less porous than ceramic); glossy finish; rectified',
 '4"×12"','sq_ft',2.99,4.49,
 'Available Floor & Decor',
 '{"White","Light Gray"}',
 'Porcelain is preferred for large shower enclosures; easier to keep clean.'),

('shower_wall_tile','large_format','{"bathroom"}','best',
 'Daltile Perpetuo Porcelain (Large Format Shower Wall)','Daltile',
 'Large-format rectified porcelain for shower walls; minimal grout lines; modern look',
 '12"×24" or 24"×48"','sq_ft',4.99,8.99,
 'Larger format (24×48) requires additional labor; price here is tile only',
 '{"Light Gray","Warm Beige","Charcoal"}',
 'Larger format means fewer grout lines = easier to clean. Very popular on primary showers.'),

('shower_wall_tile','large_format','{"bathroom"}','best',
 'Porcelanosa RODANO Porcelain Wall Tile','Porcelanosa',
 'Spanish porcelain large-format wall tile; premium surface quality; slim profile',
 '12"×35" or 24"×47"','sq_ft',9.99,16.99,
 'Porcelanosa Atlanta showroom; coordinated floor tile available',
 '{"Caliza","Antracita","Blanco"}',
 'The coordinated floor/wall system from Porcelanosa is very impressive visually.'),

('shower_wall_tile','large_format','{"bathroom"}','best',
 'MSI Calacatta Oro Porcelain Wall Tile (Marble-look)','MSI',
 'Bold gold-vein Calacatta porcelain; dramatic luxury look at fraction of real marble cost',
 '12"×24"','sq_ft',4.99,7.49,NULL,
 '{"White with gold veining"}',
 'Very popular for primary shower feature walls. Floor & Decor stock.'),

('shower_wall_tile','large_format','{"bathroom"}','luxury',
 'Porcelanosa Urbatek Ultra-Thin Porcelain Panel','Porcelanosa / Urbatek',
 'High-tech sintered stone panel; 6mm or 12mm thick; slab-look with virtually no grout lines',
 '24"×48" to 60"×120"','sq_ft',18.00,35.00,
 'Installation requires specialized adhesive and installer experience',
 '{"Slate Gray","Calacatta","Concrete","Nero"}',
 'Top-tier shower wall material. Stunning in walk-in showers.'),

('shower_wall_tile','natural_stone','{"bathroom"}','luxury',
 'MSI Calacatta Gold Marble Polished Wall Tile','MSI',
 'Real Italian Calacatta marble; dramatic gold veining; bookmatched slabs possible',
 '12"×24"','sq_ft',14.99,24.99,
 'Sealing required; may etch from soap; coach client on maintenance',
 '{"Calacatta Gold White"}',
 'Reserve for high-budget primary showers only. Ongoing maintenance required.');


-- ============================================================
-- 6. SHOWER FLOOR TILE  (per sq ft, material only)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('shower_floor_tile','mosaic','{"bathroom"}','good',
 'Daltile Keystones Mosaic — White Porcelain','Daltile',
 'White matte porcelain penny round mosaic on 12"×12" mesh; slip-resistant',
 '1" penny round on 12"×12" sheet','sq_ft',3.49,5.29,
 'Price per sq ft of coverage; available Daltile showroom',
 '{"White","Light Gray"}',
 'Classic shower floor. Many grout lines = good slip resistance.'),

('shower_floor_tile','mosaic','{"bathroom"}','good',
 'MSI White Porcelain Hexagon Mosaic','MSI',
 '2" hex matte porcelain mosaic on mesh; very popular contemporary shower floor',
 '2" hex on 12"×12" sheet','sq_ft',2.99,4.49,NULL,
 '{"White","Light Gray","Carrara-look"}',
 'Available Floor & Decor. Hex is the most-requested shower floor shape.'),

('shower_floor_tile','mosaic','{"bathroom"}','better',
 'Daltile Fanfare 2×2 Porcelain Mosaic','Daltile',
 '2"×2" matte porcelain mosaic; DCOF ≥0.42 for wet area compliance; rectified',
 '2"×2" on 12"×12" sheet','sq_ft',3.99,6.49,
 'Good DCOF slip-resistance rating; coordinates with Daltile wall tiles',
 '{"White","Gray","Taupe","Charcoal"}',
 'Ask Daltile rep for DCOF certification sheet for permit file.'),

('shower_floor_tile','mosaic','{"bathroom"}','better',
 'MSI Calacatta Marble-Look Hex Porcelain Mosaic','MSI',
 'Calacatta marble-look matte porcelain hex; combines marble aesthetic with porcelain durability',
 '2" hex on 12"×12" sheet','sq_ft',4.49,6.99,NULL,
 '{"White with gray/gold veining"}',
 'Pairs perfectly with MSI Calacatta wall tiles for coordinated look.'),

('shower_floor_tile','pebble','{"bathroom"}','better',
 'MSI Natural Pebble Tile (River Rock)','MSI',
 'Natural river pebble on mesh; organic look; good texture for slip resistance',
 '12"×12" sheet','sq_ft',5.99,8.99,
 'Pebble tile requires more grout and more complex installation',
 '{"Natural brown/gray mix","Black"}',
 'Clients love the look; warn them about grout maintenance between pebbles.'),

('shower_floor_tile','mosaic','{"bathroom"}','best',
 'Porcelanosa Mini-Hex Porcelain Mosaic','Porcelanosa',
 'Premium Spanish mini-hex porcelain mosaic; very fine texture; maximum slip resistance',
 '1" hex on 12"×12" sheet','sq_ft',7.99,12.99,
 'Available Porcelanosa Atlanta showroom',
 '{"Blanco","Greige","Charcoal"}',
 'Coordinates with Porcelanosa RODANO wall tiles.'),

('shower_floor_tile','mosaic','{"bathroom"}','best',
 'Artistic Tile Linear Mosaic — Handcut Glass + Stone Mix','Artistic Tile',
 'Handcut glass and natural stone mosaic blend; designer-curated; high visual interest',
 '1"×3" linear on 12"×12" sheet','sq_ft',12.00,19.99,
 'Available Artistic Tile Atlanta showroom; lead time 2–4 weeks',
 '{"Multiple curated color palettes"}',
 'Used as an accent or full shower floor on high-end bathrooms.'),

('shower_floor_tile','natural_stone','{"bathroom"}','luxury',
 'MSI Thassos White Marble Penny Round Mosaic','MSI',
 'Polished Thassos white marble penny rounds; pure white; prestigious natural stone',
 '1" penny on 12"×12" sheet','sq_ft',14.99,22.99,
 'Requires sealing; polished finish is slippery — use honed version for shower floors',
 '{"Pure White Thassos"}',
 'Specify HONED (not polished) for shower floor application.');


-- ============================================================
-- 7. SHOWER DOORS / ENCLOSURES
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('shower_doors','sliding_semi_frameless','{"bathroom"}','good',
 'DreamLine Encore Semi-Frameless Bypass Sliding Shower Door','DreamLine',
 'Semi-frameless aluminum frame bypass sliding door; 1/4" clear tempered glass',
 '56"–60"×76" H','each',279,399,
 'Price for the door only; does not include threshold, installation, or any tile work',
 '{"Chrome","Brushed Nickel","Oil-Rubbed Bronze"}',
 'Most popular budget shower enclosure. Good for hall and guest baths.'),

('shower_doors','sliding_semi_frameless','{"bathroom"}','good',
 'MAAX Halo Semi-Frameless Shower Door','MAAX',
 'Semi-frameless bypass sliding door; 1/4" glass; easy clean coating available',
 '56"–60"×71.5" H','each',319,459,
 'Available Home Depot',
 '{"Chrome","Brushed Nickel"}',
 'MAAX is a solid mid-market brand. Good for hall baths.'),

('shower_doors','sliding_frameless','{"bathroom"}','better',
 'DreamLine Enigma-X Fully Frameless Sliding Shower Door','DreamLine',
 'Frameless sliding (bypass) door; 3/8" clear tempered glass; polished stainless track',
 '56"–60"×76" H','each',649,849,
 '44"–48" version also available ~$499–$699',
 '{"Polished Stainless","Brushed Stainless","Matte Black"}',
 'Best-selling frameless sliding door. Clean look with no visible frame.'),

('shower_doors','pivot_frameless','{"bathroom"}','better',
 'DreamLine Elegance Frameless Pivot Shower Door','DreamLine',
 'Heavy frameless pivot door; 3/8" glass; adjustable width with buttress panel',
 '25.25"–27.25"×72" H (single)','each',499,749,
 'For alcove showers; custom-width models available up to 56"',
 '{"Chrome","Brushed Nickel","Oil-Rubbed Bronze","Matte Black"}',
 'Pivot doors look clean and are easier to clean than sliding doors.'),

('shower_doors','hinged_frameless','{"bathroom"}','best',
 'DreamLine Unidoor Frameless Hinged Shower Door','DreamLine',
 'Frameless hinged door with support arm; 3/8" glass; reversible for left or right opening',
 '22"–36"×72" H','each',799,1099,
 'Unidoor Plus (with half panel) for wider openings: $999–$1,499',
 '{"Chrome","Brushed Nickel","Matte Black","Satin Gold"}',
 'The go-to frameless door for primary showers. Very popular.'),

('shower_doors','frameless_enclosure','{"bathroom"}','best',
 'Kohler Levity Semi-Frameless Sliding Shower Door','Kohler',
 'Kohler brand semi-frameless sliding; easy-clean CoatTech glass coating; premium hardware',
 '44"–48" or 56"–60"×74" H','each',749,1099,
 'Kohler brand premium; available at most major kitchen and bath showrooms',
 '{"Bright Polished Silver","Matte Nickel","Matte Black"}',
 'Kohler brand gives clients confidence. CoatTech coating reduces cleaning.'),

('shower_doors','neo_angle','{"bathroom"}','best',
 'DreamLine Prism Plus Frameless Neo-Angle Shower Enclosure','DreamLine',
 'Frameless neo-angle 3-panel enclosure for corner shower bases; 3/8" glass',
 '34"×34" base','each',899,1299,NULL,
 '{"Chrome","Brushed Nickel","Matte Black"}',
 'For neo-angle corner shower bases. Dramatic look, efficient footprint.'),

('shower_doors','frameless_enclosure','{"bathroom"}','luxury',
 'Kohler Choreograph 3-Wall Walk-In Shower System','Kohler',
 'Full shower surround + frameless glass door system; configurable panels; integrated shelving',
 'Custom width to 60"','each',2200,4500,
 'Surround panels included; excludes plumbing rough-in and tile',
 '{"Matte Black","Brushed Nickel","Polished Chrome"}',
 'All-in-one premium system. Reduces tile work; faster installation.'),

('shower_doors','frameless_enclosure','{"bathroom"}','luxury',
 'DreamLine SHDR Custom Frameless Heavy-Glass Panel (3/8" to 1/2")','DreamLine',
 'Custom-cut frameless shower glass panel or enclosure; up to 1/2" thick glass; no hardware visible',
 'Custom size up to 78"×96"','each',1800,4000,
 'Requires custom template measurement; 3–4 week lead time after template',
 '{"Frameless clear glass","Low-iron ultra-clear glass"}',
 'For walk-in showers without a door. Most luxurious open shower look.');


-- ============================================================
-- 8. TOILETS
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('toilets','two_piece','{"bathroom"}','good',
 'American Standard Cadet 3 Two-Piece Elongated','American Standard',
 'Comfort height two-piece elongated toilet; PowerWash rim scrubbing; 1.28 GPF',
 'Standard rough-in 12"','each',229,299,
 'Includes toilet; excludes seat (add $30–$60 for soft-close seat)',
 '{"White","Bone","Linen"}',
 'AS workhorse. Excellent flush performance. Very common in remodels.'),

('toilets','two_piece','{"bathroom"}','good',
 'Kohler Cimarron Comfort Height Two-Piece Elongated','Kohler',
 'AquaPiston canister flush; comfort height; quiet close seat option',
 'Standard 12" rough-in','each',299,399,
 'Includes toilet only; add $40–$80 for quiet-close seat',
 '{"White","Biscuit","Ice Grey","Dune"}',
 'Kohler brand is a big upgrade perception for clients over a similar price.'),

('toilets','two_piece','{"bathroom"}','good',
 'Gerber Viper Elongated Two-Piece Comfort Height','Gerber',
 'HET 1.28 GPF; comfort height; good performance, often overlooked brand',
 '12" rough-in','each',199,279,NULL,
 '{"White"}',
 'Good budget option. Gerber makes very reliable toilets without the brand premium.'),

('toilets','one_piece','{"bathroom"}','better',
 'TOTO Drake II Two-Piece Elongated with Tornado Flush','TOTO',
 'TOTO''s most popular two-piece; Tornado flush rim-less bowl; 1.28 GPF; cefiontect glazing',
 'Universal height (17–18") 12" rough-in','each',449,599,
 'Add $100–$150 for Washlet+ compatible seat',
 '{"Cotton White","Bone","Sedona Beige"}',
 'TOTO Drake is the most popular mid-tier toilet in Atlanta remodels.'),

('toilets','one_piece','{"bathroom"}','better',
 'Kohler Santa Rosa One-Piece Elongated Comfort Height','Kohler',
 'Compact elongated one-piece; AquaPiston flush; integrated trapway; easy to clean',
 '12" rough-in, 29" L','each',449,599,NULL,
 '{"White","Almond","Biscuit"}',
 'One-piece is easier to clean than two-piece. Good for primary baths.'),

('toilets','one_piece','{"bathroom"}','best',
 'TOTO Aquia IV One-Piece Dual-Flush Elongated','TOTO',
 'Slim, modern one-piece; Tornado flush; dual-flush 1.28/0.8 GPF; CeFiONtect',
 '12" rough-in, 28.5" L','each',699,899,
 'Pairs with TOTO C5 or C5 Washlet seat ($350–$550 additional)',
 '{"Cotton White","Bone"}',
 'Very popular for primary bathrooms. Modern profile. Easy Washlet integration.'),

('toilets','one_piece','{"bathroom"}','best',
 'American Standard Studio S One-Piece Elongated Comfort Height','American Standard',
 'Modern skirted one-piece; right-height; EverClean antimicrobial surface; 1.28 GPF',
 '12" rough-in','each',649,849,NULL,
 '{"White","Bone"}',
 'Good best-tier at lower price than TOTO. Clean modern look.'),

('toilets','wall_hung','{"bathroom"}','luxury',
 'TOTO RP Wall-Hung Toilet with Duofit In-Wall Tank','TOTO',
 'Wall-hung toilet with concealed in-wall tank carrier; adjustable height 15–19"; Tornado flush',
 'Wall-hung; carrier required (sold separately ~$600–$900)','each',1299,1899,
 'Price for toilet bowl only; Duofit carrier is separate; also need in-wall rough-in frame',
 '{"Cotton White","Bone"}',
 'Wall-hung toilets are the most requested luxury bathroom item. Floating look.'),

('toilets','smart_toilet','{"bathroom"}','luxury',
 'TOTO Neorest NX1 One-Piece Smart Toilet','TOTO',
 'Integrated Washlet bidet seat; auto open/close lid; eWater+ electrolyzed water; heated seat; CEFIONTECT',
 '12" rough-in','each',3500,4500,
 'All-in-one unit; no separate seat needed',
 '{"Cotton White"}',
 'The ultimate smart toilet. Reserve for luxury primary bathrooms with high budgets.'),

('toilets','smart_toilet','{"bathroom"}','luxury',
 'Kohler Innate Intelligent Toilet with Bidet Seat','Kohler',
 'One-piece smart toilet with integrated bidet; heated seat; auto flush; UV light sanitizer',
 '12" rough-in','each',2999,3999,NULL,
 '{"White"}',
 'Kohler''s flagship smart toilet. Slightly lower price than TOTO Neorest.');


-- ============================================================
-- 9. VANITIES (cabinet only unless noted; add countertop separately)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('vanities','single_sink','{"bathroom"}','good',
 'OVE Decors 30" Single Sink Vanity with Top','OVE Decors',
 'Ready-to-assemble vanity with cultured marble top and integrated sink; soft-close doors',
 '30"W × 21"D × 34"H','each',349,499,
 'All-in price (vanity + top); no faucet included',
 '{"White","Dove Gray"}',
 'Home Depot / Costco. Good budget option for guest bathrooms.'),

('vanities','single_sink','{"bathroom"}','good',
 'Glacier Bay Constructor 36" Single Sink Vanity with Top','Glacier Bay / Home Depot',
 'Stock RTA vanity with cultured marble top; soft-close hinges; Home Depot exclusive',
 '36"W × 21"D × 34"H','each',399,529,NULL,
 '{"White","Gray"}',
 'Reliable entry-level vanity. Fine for guest and hall baths.'),

('vanities','single_sink','{"bathroom"}','better',
 'Fresca Formosa 36" Single Sink Vanity','Fresca',
 'Solid wood frame; modern slab-door style; dovetail drawer boxes; soft-close; no top included',
 '36"W × 20"D × 35"H','each',649,849,
 'Top sold separately (quartz top from Fresca ~$200–$350 additional)',
 '{"White","Gray","Teak","Acacia"}',
 'Fresca offers a great modern look at mid-range price. Popular in primary baths.'),

('vanities','double_sink','{"bathroom"}','better',
 'Fresca Formosa 48" Double Sink Vanity','Fresca',
 'Solid wood double vanity; modern slab doors; soft-close; no top',
 '48"W × 20"D × 35"H','each',1099,1399,
 'Top sold separately',
 '{"White","Gray","Teak"}',
 'Good double vanity for primary baths on moderate budgets.'),

('vanities','single_sink','{"bathroom"}','better',
 'Strasser Woodenworks 36" Shaker Vanity (Cabinet Only)','Strasser Woodenworks',
 'Solid wood shaker-style vanity cabinet; dovetail drawers; fully customizable hardware',
 '36"W × 21"D × 34.5"H','each',899,1199,
 'Cabinet only; top, sink, and faucet sold separately',
 '{"50+ painted colors","Stained wood options"}',
 'Semi-custom. Strasser is a great mid-to-best tier option. 8-week lead time.'),

('vanities','double_sink','{"bathroom"}','best',
 'James Martin Palisades 60" Double Sink Vanity','James Martin',
 'Solid poplar + plywood box; soft-close; transitional style; top options available',
 '60"W × 23.5"D × 35.3"H','each',1799,2299,
 'Vanity only (no top); quartz top kit from James Martin adds ~$400–$700',
 '{"Bright White","Silvered Oak","Burnished Mahogany"}',
 'Home Depot and specialty dealers. Very popular primary bath double vanity.'),

('vanities','double_sink','{"bathroom"}','best',
 'James Martin Palisades 72" Double Sink Vanity','James Martin',
 'Largest Palisades; full-width primary bathroom statement piece; same solid construction',
 '72"W × 23.5"D × 35.3"H','each',2299,2999,
 'Vanity only; quartz top adds ~$600–$900',
 '{"Bright White","Silvered Oak","Burnished Mahogany"}',
 'Consider freight delivery lead time when scheduling.'),

('vanities','single_sink','{"bathroom"}','best',
 'James Martin Addison 36" Single Sink Vanity','James Martin',
 'Solid birch frame; shaker style; 3 full-extension drawers; dove-tail joints',
 '36"W × 21.5"D × 35"H','each',1099,1399,NULL,
 '{"Mid Century Acacia","Smoky Celadon","Warm Gray"}',
 'Good primary bath single vanity at best tier.'),

('vanities','freestanding','{"bathroom"}','luxury',
 'Robern Profiles Frameless Vanity (Custom Built)','Robern',
 'Semi-custom frameless floating vanity; solid wood; available lighted mirrors integrated; modern',
 '36"–72" W (configurable)','each',3500,7500,
 'Highly variable by configuration; lead time 6–10 weeks',
 '{"Matte White","Matte Gray","Walnut","Latte"}',
 'Robern is the gold standard for luxury bath vanities. Often paired with their medicine cabinets.'),

('vanities','freestanding','{"bathroom"}','luxury',
 'Lacava Luxury Freestanding Vanity with Integrated Stone Top','Lacava',
 'European-designed freestanding vanity with stone vessel sink integrated; designer showpiece',
 '32"–60" W','each',4500,9500,
 'Available through specialty plumbing showrooms in Atlanta',
 '{"Matte White","Custom painted"}',
 'Reserve for high-budget primary bath projects with design-forward clients.');


-- ============================================================
-- 10. BATHROOM FAUCETS & FIXTURES
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('bath_faucets','single_hole','{"bathroom"}','good',
 'Moen Adler Single-Handle Bathroom Faucet','Moen',
 'Single-handle single-hole lavatory faucet; cartridge technology; limited lifetime warranty',
 'Deck mount, 4" max spread','each',79,119,
 'Includes drain assembly; no supply lines',
 '{"Chrome","Spot Resist Brushed Nickel","Mediterranean Bronze"}',
 'Moen Adler is the most common budget faucet in remodels. Reliable.'),

('bath_faucets','single_hole','{"bathroom"}','good',
 'Delta Foundations Single-Handle Bathroom Faucet','Delta',
 'Single-handle faucet; Diamond seal technology; lead-free; easy installation',
 'Deck mount','each',59,99,NULL,
 '{"Chrome","Brushed Nickel"}',
 'Delta Foundations is the entry-level line. Good for guest and basement baths.'),

('bath_faucets','widespread','{"bathroom"}','better',
 'Moen Brantford Widespread 2-Handle Bathroom Faucet','Moen',
 'Traditional widespread 2-handle lavatory faucet; 8" spread; ceramic disc valve',
 '8" spread (2-3 hole)','each',199,279,
 'Includes drain assembly',
 '{"Oil-Rubbed Bronze","Spot Resist Brushed Nickel","Chrome","Matte Black"}',
 'The Moen Brantford is one of the most popular bathroom faucets in Atlanta remodels.'),

('bath_faucets','widespread','{"bathroom"}','better',
 'Delta Cassidy Widespread 2-Handle Bathroom Faucet','Delta',
 'Traditional 2-handle widespread; Touch2O optional; ceramic disc cartridges',
 '8" spread','each',199,289,NULL,
 '{"Champagne Bronze","Venetian Bronze","Chrome","Matte Black"}',
 'Delta Champagne Bronze finish is very popular in current market.'),

('bath_faucets','single_hole','{"bathroom"}','better',
 'Kohler Georgeson Single-Handle Bathroom Faucet','Kohler',
 'Contemporary single-handle; ceramic disc valve; ADA compliant; drain included',
 'Deck mount','each',229,299,NULL,
 '{"Polished Chrome","Vibrant Brushed Nickel","Matte Black"}',
 'Kohler brand resonates with clients in better-tier bathrooms.'),

('bath_faucets','widespread','{"bathroom"}','best',
 'Kohler Alteo Widespread Bathroom Faucet','Kohler',
 'Contemporary widespread; metal drain included; ceramic disc valves; premium Kohler finish',
 '8" spread','each',349,479,NULL,
 '{"Polished Chrome","Vibrant Brushed Nickel","Matte Black","Vibrant Brushed Moderne Brass"}',
 'Vibrant Brushed Moderne Brass is a standout finish that elevates a bathroom.'),

('bath_faucets','widespread','{"bathroom"}','best',
 'Delta Trinsic Widespread Bathroom Faucet','Delta',
 'Minimalist linear design; Touch2O.xt touchless option; Delta InnoFlex supply lines',
 '8" spread','each',319,449,NULL,
 '{"Matte Black","Champagne Bronze","Stainless","Lumicoat Matte Black"}',
 'Trinsic in matte black is one of the most popular design faucets right now.'),

('bath_faucets','wall_mount','{"bathroom"}','best',
 'Moen Weymouth Wall-Mount Bathroom Faucet','Moen',
 'Traditional wall-mount lavatory faucet; requires wall-mounted installation (rough-in)',
 'Wall mount, 8" spread','each',449,649,
 'Requires in-wall rough-in; coordinate with plumber',
 '{"Chrome","Brushed Nickel","Oil-Rubbed Bronze"}',
 'Wall-mount faucets are a luxury statement piece; coordinate with vessel or countertop sink.'),

('bath_faucets','widespread','{"bathroom"}','luxury',
 'Brizo Odin Widespread Bathroom Faucet','Brizo',
 'Brizo luxury line (Delta sub-brand); heirloom-quality construction; SmartTouch available',
 '8" spread','each',799,1099,NULL,
 '{"Luxe Gold","Matte Black","Polished Chrome","Platinum"}',
 'Brizo is the top-tier faucet brand available through plumbing showrooms.'),

('bath_faucets','widespread','{"bathroom"}','luxury',
 'Kohler Purist Widespread Faucet','Kohler',
 'Iconic minimalist Kohler design; solid brass; ultra-smooth ceramic disc valves',
 '8" spread','each',699,999,NULL,
 '{"Polished Chrome","Vibrant Brushed Nickel","Matte Black","Vibrant Brushed Moderne Brass"}',
 'Kohler Purist is a timeless design that clients recognize from hotel stays.');


-- ============================================================
-- 11. BAR / KITCHEN CABINETS  (priced per linear foot of cabinet run)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('cabinets','stock','{"kitchen","basement"}','good',
 'Hampton Bay Stock Shaker Cabinet Line','Hampton Bay / Home Depot',
 'Stock RTA shaker cabinets; plywood box; soft-close hinges; solid wood face frame',
 'Standard 12"–36" base, 12"–36" wall; 30" and 42" wall height','lin_ft',80,140,
 'Per linear foot of combined upper+lower run; does not include crown, trim, or hardware',
 '{"Satin White","Dove Gray","Cognac"}',
 'Home Depot stock. Lead time 1–3 days. Good for basement wet bars and budget kitchens.'),

('cabinets','stock','{"kitchen","basement"}','good',
 'IKEA SEKTION Kitchen Cabinet System','IKEA',
 'Flat-pack cabinet system; European-style frameless; durable melamine box; BLUM hardware',
 'Custom configurations to 36" base','lin_ft',75,130,
 'Estimate based on average IKEA kitchen; includes base + wall units + BLUM hardware',
 '{"Axstad White","Bodbyn Gray","Voxtorp Walnut + others"}',
 'IKEA kitchens require detailed planning using their Planner tool. Labor is comparable.'),

('cabinets','semi_custom','{"kitchen","basement"}','better',
 'KraftMaid Semi-Custom Cabinetry (Lowes/Dealer)','KraftMaid / Masco',
 'Semi-custom; plywood box; full-access or face-frame; soft-close; wide modification options',
 'Modifications to 3" increments; heights to 54"','lin_ft',180,380,
 'Wide range based on door style and finish; Lowes and independent dealers',
 '{"100+ door styles and finishes"}',
 'Most popular semi-custom brand in Atlanta. 3–6 week lead time.'),

('cabinets','semi_custom','{"kitchen","basement"}','better',
 'Aristokraft Semi-Custom Cabinetry','Aristokraft / MasterBrand',
 'Semi-custom; face frame construction; dovetail drawers; 3/4" plywood box option',
 'Modifications to 3" increments','lin_ft',160,320,NULL,
 '{"50+ door styles; painted, stained, glazed"}',
 'Available through local cabinet dealers. Good quality for the price.'),

('cabinets','semi_custom','{"kitchen"}','better',
 'Merillat Classic Semi-Custom Cabinetry','Merillat',
 'All-plywood box construction; American-made; face-frame; good warranty',
 'Standard modifications','lin_ft',175,350,NULL,
 '{"Maple, Hickory, Cherry, Oak — stain and paint options"}',
 'Strong quality reputation. Available through dealer network in Atlanta area.'),

('cabinets','semi_custom','{"kitchen"}','best',
 'Dura Supreme Semi-Custom Cabinetry','Dura Supreme',
 'High-end semi-custom; 3/4" plywood throughout; full-extension undermount soft-close; wide catalog',
 'Modifications to 1/8" increments; heights to 60"','lin_ft',300,600,
 'Lead time 4–8 weeks; requires dealer',
 '{"Extensive door styles; custom painted, glazed, stained"}',
 'Step above KraftMaid; noticeable quality difference in hardware and fit.'),

('cabinets','semi_custom','{"kitchen"}','best',
 'Wellborn Cabinet (Forest or Estate Series)','Wellborn',
 'American-made semi-custom; all-plywood; extensive modification options; strong warranty',
 'Custom sizing','lin_ft',280,550,NULL,
 '{"Wide range of stained and painted finishes"}',
 'Made in Alabama. Good regional choice. Available through dealer network.'),

('cabinets','custom','{"kitchen"}','luxury',
 'Plain & Fancy Custom Cabinetry','Plain & Fancy',
 'True custom American-made cabinetry; any size, any finish, bespoke details; lead time 10–14 weeks',
 'Fully custom','lin_ft',600,1200,
 'Highly variable; price is a ballpark for Atlanta-area projects',
 '{"Unlimited painted, lacquered, and stained options"}',
 'For high-budget kitchen remodels and home additions. True heirloom quality.'),

('cabinets','custom','{"kitchen"}','luxury',
 'Bilotta Kitchens Custom Import Cabinetry (Italian)','Bilotta',
 'European frameless custom cabinets; Italian-made; ultra-precise tolerances; design-driven',
 'Fully custom; imported','lin_ft',800,1800,
 'Lead time 12–20 weeks including shipping; available through Atlanta design showrooms',
 '{"Custom lacquers, wood veneers, high-gloss options"}',
 'Reserve for luxury kitchen remodels with full design team involvement.');


-- ============================================================
-- 12. COUNTERTOPS  (per sq ft, material only / fabricated and templated)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('countertops','laminate','{"kitchen","basement","bathroom"}','good',
 'Wilsonart Classic Laminate Countertop (Post-Formed)','Wilsonart',
 'High-pressure laminate; post-formed with integrated backsplash; DIY-friendly',
 '25"D × custom length','sq_ft',8,18,
 'Per sq ft fabricated and delivered (no install labor); eased or bevel edge standard',
 '{"100+ patterns including solid, wood-look, stone-look"}',
 'Budget-friendly and durable. Wilsonart has vastly improved aesthetics.'),

('countertops','laminate','{"kitchen","basement"}','good',
 'Formica 180fx Laminate Countertop','Formica',
 'High-pressure laminate in stone-look patterns; 180fx line mimics natural stone convincingly',
 '25"D × custom length','sq_ft',10,20,NULL,
 '{"Calacatta Marble look","Tan Brown Granite look","Bianco Antico look"}',
 'The 180fx patterns are genuinely impressive at this price point.'),

('countertops','quartz','{"kitchen","bathroom","basement"}','better',
 'MSI Quartz — Calacatta Laza (Engineered Quartz)','MSI',
 'Engineered quartz; white background with subtle gray veining; scratch and stain resistant',
 'Custom fabricated slabs','sq_ft',55,80,
 'Per sq ft fabricated, templated, and delivered (no install labor); standard eased edge',
 '{"Calacatta Laza (white/gray)","Calacatta Miraggio Gold (white/gold)"}',
 'MSI is the best-value quartz brand in Atlanta. Available many local fabricators.'),

('countertops','quartz','{"kitchen","bathroom"}','better',
 'Silestone Quartz — Eternal Collection','Silestone / Cosentino',
 'HybriQ+ technology; scratch and heat resistant; wide color range; Eco by Cosentino',
 'Custom fabricated slabs','sq_ft',65,95,NULL,
 '{"Eternal Statuario","Eternal Calacatta Gold","Eternal Marquina (black)"}',
 'Silestone is the best-known quartz brand. Strong showroom presence in Atlanta.'),

('countertops','quartz','{"kitchen","bathroom"}','best',
 'Cambria Quartz — Brittanicca or Skara Brae','Cambria',
 'American-made quartz; thicker slabs (1.2" vs 3/4" industry standard); exceptional visual quality',
 'Custom fabricated slabs','sq_ft',85,130,
 'Cambria''s thickness and edge detail options are significantly superior to import quartz',
 '{"Brittanicca (white/soft gray)","Skara Brae (organic movement)","100+ designs"}',
 'Premium quartz. Cambria is the #1 American-made quartz brand. Very popular in Atlanta kitchens.'),

('countertops','granite','{"kitchen","bathroom"}','better',
 'MSI Natural Granite — Bianco Romano or New Venetian Gold','MSI',
 'Quarried granite slab; unique natural movement; heat and scratch resistant',
 'Custom fabricated slabs','sq_ft',45,75,
 'Highly variable by slab lot; view actual slab before purchase',
 '{"Bianco Romano","New Venetian Gold","Black Pearl","Santa Cecilia"}',
 'Granite remains popular for its uniqueness. Price varies widely by color/rarity.'),

('countertops','granite','{"kitchen","bathroom"}','best',
 'Level 3/4 Exotic Granite (Blue Bahia, Fusion, etc.)','Various quarries',
 'Exotic granite with dramatic movement and color; truly one-of-a-kind slabs',
 'Custom fabricated slabs','sq_ft',85,150,
 'Priced per slab; must view and select actual slab',
 '{"Blue Bahia","Fusion (Juparana)","Lemurian Blue","Asterix"}',
 'For high-end kitchens where the countertop is the focal point.'),

('countertops','marble','{"kitchen","bathroom"}','best',
 'Carrara White Marble (Honed or Polished)','Various quarries',
 'Italian Carrara marble; honed finish for kitchen (less glare, hides etching better)',
 'Custom fabricated slabs','sq_ft',75,120,
 'Requires sealing; will etch from acids (lemon juice, wine); coach client on expectations',
 '{"Carrara White Honed","Carrara White Polished"}',
 'Timeless classic. Always coach clients on etching and maintenance before selecting marble.'),

('countertops','quartzite','{"kitchen","bathroom"}','luxury',
 'Taj Mahal Quartzite (Leathered or Polished)','Various quarries',
 'Natural quartzite (harder than marble); creamy white with gold veining; dramatic and durable',
 'Custom fabricated slabs','sq_ft',120,200,
 'Natural quartzite; must view actual slab; significant variation between lots',
 '{"Leathered finish (popular)","Polished"}',
 'Taj Mahal quartzite is the most in-demand luxury countertop in Atlanta right now.'),

('countertops','quartzite','{"kitchen","bathroom"}','luxury',
 'Super White Quartzite (Dolomite)','Various quarries',
 'White quartzite with soft gray veining; often mislabeled — confirm true quartzite vs dolomite',
 'Custom fabricated slabs','sq_ft',100,170,
 'Confirm material with fabricator: true quartzite is harder than marble/dolomite',
 '{"White with soft gray veining"}',
 'Note: "Super White" is sometimes dolomite (softer). Always verify hardness with fabricator.'),

('countertops','butcher_block','{"kitchen","basement"}','better',
 'Boos & Co. Hard Maple Butcher Block Countertop','John Boos & Co.',
 'End-grain or edge-grain hard maple; oiled or varnique finish; classic kitchen warmth',
 '1.5" or 2.25" thick × custom L/W','sq_ft',35,65,
 'Material only; fabrication from slab; requires periodic oiling if end-grain',
 '{"Hard Maple (natural)","Walnut (edge-grain, premium)"}',
 'Very popular for kitchen islands and bar areas. Pairs well with quartz perimeter tops.');


-- ============================================================
-- 13. BATH ACCESSORIES  (priced per set or per piece)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('bath_accessories','set','{"bathroom"}','good',
 'Moen Caldwell 3-Piece Accessory Set','Moen',
 'Includes 24" towel bar, toilet paper holder, and robe hook; lifetime warranty',
 '24" towel bar','set',79,119,
 'Moen Spot Resist finish resists fingerprints and water spots',
 '{"Chrome","Spot Resist Brushed Nickel","Mediterranean Bronze","Matte Black"}',
 'Best-selling entry bath accessory set. Reliable and attractive.'),

('bath_accessories','set','{"bathroom"}','good',
 'Delta Arzo 3-Piece Towel Bar, TP Holder, Hook Set','Delta',
 'Coordinated 3-piece bath accessory set; solid brass construction; lifetime warranty',
 '24" towel bar','set',89,129,NULL,
 '{"Chrome","Brushed Nickel","Venetian Bronze","Champagne Bronze"}',
 'Delta Champagne Bronze finish is a popular upgrade at modest cost.'),

('bath_accessories','set','{"bathroom"}','better',
 'Kohler Purist 3-Piece Accessory Set (Towel Bar, TP, Hook)','Kohler',
 'Minimalist Purist design; solid brass; polished or brushed premium finish',
 '24" towel bar','set',199,299,
 'Individual pieces also available; towel ring ($79), 18" bar ($149) also available',
 '{"Polished Chrome","Vibrant Brushed Nickel","Matte Black","Vibrant Brushed Moderne Brass"}',
 'Kohler Purist matches their faucet line. Very popular coordinated look.'),

('bath_accessories','set','{"bathroom"}','better',
 'Moen Genta 3-Piece Accessory Set','Moen',
 'Modern squared profile; MOEN matching faucet line available; solid brass; spot resist finish',
 '24" towel bar','set',149,219,NULL,
 '{"Matte Black","Spot Resist Brushed Nickel","Chrome"}',
 'Matte Black is the top-selling finish in bath accessories right now.'),

('bath_accessories','set','{"bathroom"}','better',
 'Delta Nicoli 4-Piece Accessory Set (includes 18" + 24" bar)','Delta',
 'Transitional style; 4-piece set with two towel bars; toilet paper holder; robe hook',
 '18" and 24" bars','set',189,269,NULL,
 '{"Chrome","Champagne Bronze","Matte Black","Brushed Nickel"}',
 'The 4-piece set covers a typical primary bathroom completely.'),

('bath_accessories','individual','{"bathroom"}','best',
 'Brizo Odin 24" Towel Bar','Brizo',
 'Luxury designer towel bar; solid brass; Brizo''s heirloom finish quality',
 '24"','each',189,259,
 'Other pieces (TP holder, hook, ring) sold separately at similar price points',
 '{"Luxe Gold","Matte Black","Polished Chrome","Platinum"}',
 'Brizo pieces are sold individually; budget $500–$800 for a full 4-piece set.'),

('bath_accessories','set','{"bathroom"}','best',
 'Kohler Composed 5-Piece Accessory Set','Kohler',
 'Modern asymmetric design; solid brass; 5-piece including double towel bar, ring, TP, hook',
 '18" and 24" bars included','set',399,549,
 'One of Kohler''s premium accessory lines; coordinates with Composed faucet',
 '{"Vibrant Brushed Nickel","Matte Black","Polished Chrome"}',
 'Good value for a full 5-piece set at best tier.'),

('bath_accessories','set','{"bathroom"}','luxury',
 'Waterworks Regulator 5-Piece Accessory Set','Waterworks',
 'American-made designer accessories; hand-polished solid brass; heirloom quality',
 '24" main bar','set',900,1400,
 'Available Waterworks Atlanta showroom',
 '{"Nickel","Unlacquered Brass","Matte Nickel","Burnished Nickel"}',
 'Waterworks is the top luxury bath accessory brand. Matches their plumbing fixtures.');


-- ============================================================
-- 14. MEDICINE CABINETS
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('medicine_cabinets','recessed_single','{"bathroom"}','good',
 'Kohler Maxstow Recessed/Surface-Mount Single Door','Kohler',
 'Anodized aluminum frame; mirrored interior; 3 adjustable shelves; recessed or surface',
 '15"W × 24"H × 3.5"D','each',229,299,
 'Available Home Depot; 20"×26" version also available ~$279–$349',
 '{"Anodized aluminum (silver)"}',
 'Kohler entry-level; solid quality, clean look.'),

('medicine_cabinets','recessed_single','{"bathroom"}','good',
 'Glacier Bay 20" Single Door Recessed Medicine Cabinet','Glacier Bay / Home Depot',
 'Steel frame; mirrored door; 2 adjustable shelves; inexpensive recessed option',
 '20"W × 26"H × 4.5"D','each',89,139,NULL,
 '{"Chrome frame"}',
 'Budget option for guest baths. Simple and functional.'),

('medicine_cabinets','recessed_tri_view','{"bathroom"}','better',
 'Kohler Maxstow 30" Two-Door Recessed Medicine Cabinet','Kohler',
 'Two-door (30" cabinet in one unit); anodized aluminum; mirrored interior and door',
 '30"W × 26"H × 3.5"D','each',379,499,NULL,
 '{"Anodized aluminum"}',
 'Good for vanities where a tri-view is too wide.'),

('medicine_cabinets','recessed_tri_view','{"bathroom"}','better',
 'American Pride Tri-View Beveled Mirror Medicine Cabinet','American Pride',
 'Tri-view 3-door recessed; beveled mirror glass doors; 6 shelves; dual mode (recessed/surface)',
 '36"W × 30"H × 4.5"D','each',249,379,
 'Available Home Depot and online',
 '{"Chrome frame","Nickel frame"}',
 'Great value tri-view at better tier. Gives a big mirror surface on a double vanity.'),

('medicine_cabinets','surface_mount','{"bathroom"}','better',
 'Kohler Verdera 20" Surface-Mount Lighted Medicine Cabinet','Kohler',
 'LED-lighted mirror cabinet; surface mount; anodized aluminum; dimmer and defogger included',
 '20"W × 30"H × 5"D','each',499,699,
 'Lighting requires electrical rough-in to cabinet location',
 '{"Anodized aluminum"}',
 'The LED and defogger features are a popular upgrade for primary baths.'),

('medicine_cabinets','surface_mount','{"bathroom"}','best',
 'Robern M Series 24"×30" Recessed/Surface Single Door','Robern',
 'Luxury medicine cabinet; frameless mirrored door; interior lighting; USB charging; electrical outlet',
 '24"W × 30"H × 4"D','each',1299,1799,
 'Electrical required inside wall; Robern has 10-yr warranty',
 '{"Flat mirror","Beveled mirror interior door option"}',
 'Robern is the gold standard for medicine cabinets. Interior lighting is a game changer.'),

('medicine_cabinets','recessed_tri_view','{"bathroom"}','best',
 'Robern M Series 48"×30" Tri-View Lighted Cabinet','Robern',
 'Three-door lighted tri-view; plug-in or hardwire; interior lighting; adjustable shelves',
 '48"W × 30"H × 4"D','each',2199,2999,
 'Allows full-width coverage over double vanities; must coordinate with vanity width',
 '{"Flat mirror"}',
 'Perfect over a 48"–60" double vanity. Spectacular lighting.'),

('medicine_cabinets','surface_mount','{"bathroom"}','luxury',
 'Robern AiO Reserve Lighted Single Door Cabinet','Robern',
 'Full-feature lighted cabinet; TUN task lighting + ambient; Bluetooth speaker; USB + outlet',
 '24"W × 30"H × 6"D','each',2899,3999,
 'Top-of-line Robern; requires electrical; 10-week lead time',
 '{"Flat mirror door"}',
 'The AiO Reserve is the most full-featured medicine cabinet on the market.');


-- ============================================================
-- 15. BAR SINKS  (each; material only)
-- ============================================================

INSERT INTO materials
  (category, subcategory, project_types, tier, name, brand, description, dimensions, unit, price_low, price_high, price_note, finish_options, notes)
VALUES

('bar_sinks','stainless_undermount','{"basement","kitchen"}','good',
 'Elkay Lustertone Undermount Bar Sink','Elkay',
 '18-gauge stainless steel undermount single bowl; sound dampening pads; lustrous satin finish',
 '15" × 15" × 7.5"D','each',149,229,
 'Most common entry-level undermount bar sink; fits standard 18" base cabinet',
 '{"Stainless Steel"}',
 'Elkay is the most trusted American sink brand. Very reliable.'),

('bar_sinks','stainless_undermount','{"basement","kitchen"}','good',
 'Kraus Standart PRO Undermount Bar Sink','Kraus',
 '16-gauge T-304 stainless steel; single bowl; NoiseDefend soundproofing',
 '15" × 15" × 8"D','each',129,199,NULL,
 '{"Stainless Steel"}',
 'Kraus offers excellent value. 16-gauge is thicker and better than standard 18-gauge.'),

('bar_sinks','stainless_undermount','{"basement","kitchen"}','better',
 'Kohler Prolific 18" Single Bowl Undermount Bar Sink','Kohler',
 'Thick-walled stainless; includes bottom bowl grid, drain; quietGuard; contemporary',
 '18" × 16" × 8.5"D','each',379,499,
 'Includes accessories (grid, drain strainer)',
 '{"Stainless Steel"}',
 'Kohler Prolific is a step up in finish quality and accessories included.'),

('bar_sinks','stainless_undermount','{"basement","kitchen"}','better',
 'Blanco Precis Undermount Bar Sink','Blanco',
 'Premium German-made stainless steel; ultra-smooth surface; sound-deadening system',
 '18" × 12" × 8"D','each',349,479,NULL,
 '{"Stainless Steel (PVD Polished or Microedge)"}',
 'Blanco stainless quality is noticeably superior to big-box brands.'),

('bar_sinks','composite_undermount','{"basement","kitchen"}','better',
 'Blanco Diamond 15" Silgranit Composite Undermount Bar Sink','Blanco',
 'SILGRANIT granite composite; scratch, heat, and stain resistant; great for bar areas',
 '15" × 15" × 8"D','each',399,549,
 'Silgranit composite is 80% granite; extraordinarily durable',
 '{"Anthracite (matte black)","White","Biscuit","Truffle"}',
 'The Anthracite Silgranit is a stunning statement in a basement bar. Very popular.'),

('bar_sinks','drop_in','{"basement","kitchen"}','good',
 'Kohler Verse Drop-In Bar Sink','Kohler',
 'Cast iron drop-in bar sink; enameled; chip and scratch resistant; classic look',
 '14" × 14" × 6.5"D','each',249,349,NULL,
 '{"White","Almond","Biscuit"}',
 'Good for bar areas where undermount is not possible. Easy install.'),

('bar_sinks','stainless_undermount','{"basement","kitchen"}','best',
 'Kohler Cairn 24" Undermount Neoroc Bar Sink','Kohler',
 'Neoroc matte stone material; heat resistant to 536°F; exceptionally durable composite',
 '24" × 12" × 8"D','each',599,799,NULL,
 '{"Matte Black"}',
 'Great for high-end basement bars or kitchen prep sink. Matte black is very popular.'),

('bar_sinks','farmhouse','{"kitchen","basement"}','best',
 'Elkay Quartz Luxe Farmhouse-Style Bar Sink (Quartz Composite)','Elkay',
 'Quartz composite apron-front bar/prep sink; retains temperature; stylish design statement',
 '25" × 18.5" × 9"D','each',749,999,NULL,
 '{"Putty","Greige","Espresso","Caviar (black)"}',
 'A farmhouse-style composite bar sink elevates a basement bar significantly.'),

('bar_sinks','stainless_undermount','{"basement","kitchen"}','luxury',
 'Julien Studio Collection Seamless Undermount Bar Sink','Julien',
 'Canadian-made professional-grade stainless; 16-gauge 304 SS; seamless radius corners; polished',
 '18" × 16" × 10"D','each',899,1299,
 'Available through specialty kitchen showrooms',
 '{"Mirror Polished Stainless","Satin Stainless"}',
 'Julien is the pro-chef''s choice for sinks. Used in ultra-high-end kitchen and bar builds.');


-- ============================================================
-- Verify row counts by category (useful for debugging)
-- ============================================================
-- SELECT category, tier, COUNT(*) FROM materials GROUP BY category, tier ORDER BY category, tier;
