-- SpanglerBuilt Material Catalog
-- Run this in your Supabase SQL editor

create table if not exists catalog_materials (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,
  subcategory   text,
  brand         text,
  product_name  text not null,
  style_type    text,
  size          text,
  finish        text,
  trim_style    text,
  unit          text default 'Each',
  material_cost numeric(10,2),
  labor_cost    numeric(10,2),
  total_installed text,
  tier          text check (tier in ('Good','Better','Best','Luxury','All')),
  photo_url     text,
  manufacturer_url text,
  description   text,
  created_at    timestamptz default now()
);

create table if not exists catalog_variants (
  id            uuid primary key default gen_random_uuid(),
  material_id   uuid references catalog_materials(id) on delete cascade,
  variant_type  text not null,  -- Style, Size, Finish, Trim
  variant_name  text not null,
  price_delta   numeric(10,2) default 0,
  photo_url     text,
  in_stock      boolean default true,
  notes         text,
  created_at    timestamptz default now()
);

-- Seed: Material Catalog from SpanglerBuilt_Material_Catalog.xlsx

insert into catalog_materials (category, subcategory, brand, product_name, style_type, size, finish, trim_style, unit, material_cost, labor_cost, total_installed, tier) values
('Flooring','LVP','Shaw Floors','Floorte Pro Series','Standard','Various','Natural Biscuit','N/A','SF',1.89,1.60,'3.49','Good'),
('Flooring','LVP','COREtec Plus','Enhanced XL Series','Wide Plank 9"','Various','Vero Beach Oak','N/A','SF',2.99,2.50,'5.49','Better'),
('Flooring','Engineered Hardwood','Anderson Tuftex','Bernina Oak','Wide Plank 7"','Various','Glacier','N/A','SF',5.49,4.00,'9.49','Best'),
('Flooring','Engineered Hardwood','Hakwood','European Oak','Wide Plank 9.5"','Various','Smoked Pearl','N/A','SF',12.00,6.00,'18.00','Luxury'),
('Flooring','Carpet','Shaw Floors','Anso Nylon','Textured','Various','Greige','N/A','SF',1.50,1.25,'2.75','Good'),
('Countertops','Laminate','Wilsonart','HD Laminate','Post-form','3/4"','Calcutta Marble','N/A','SF',12.00,16.00,'28.00','Good'),
('Countertops','Quartz','Silestone','Eternal Calacatta Gold','Slab','3cm','White/Gold Veining','N/A','SF',38.00,27.00,'65.00','Better'),
('Countertops','Quartz','Cambria','Brittanicca Warm','Slab','3cm','Warm White','N/A','SF',58.00,37.00,'95.00','Best'),
('Countertops','Natural Stone','Antolini','Calacatta Borghini','Book-matched Slab','3cm','White/Gold','N/A','SF',140.00,40.00,'180.00','Luxury'),
('Cabinets','Stock','Hampton Bay','Shaker Style','Shaker','Standard','Unfinished/Paint','N/A','Allowance',null,null,'Allowance','Good'),
('Cabinets','Semi-custom','KraftMaid','Dovetail Shaker','Shaker','Standard','Dove White','N/A','Allowance',null,null,'Allowance','Better'),
('Cabinets','Semi-custom Inset','Dura Supreme','Inset Shaker Maple','Inset','Standard','Alabaster','N/A','Allowance',null,null,'Allowance','Best'),
('Cabinets','Full Custom','Plain and Fancy','Custom Any Style','Any','Any','Bespoke','N/A','Allowance',null,null,'Per Quote','Luxury'),
('Tile','Ceramic','Daltile','Restore Series','Field Tile','12x24','Bright White','N/A','SF',1.99,3.00,'4.99','Good'),
('Tile','Porcelain','MSI Surfaces','Carrara White','Field Tile','24x24','Polished','N/A','SF',3.99,5.00,'8.99','Better'),
('Tile','Large Format Porcelain','Porcelanosa','Marmol Calacatta','Field Tile','32x32','Polished','N/A','SF',7.99,7.00,'14.99','Best'),
('Tile','Natural Stone','Ann Sacks','Bianco Dolomite','Honed Slab','24x48','Honed','N/A','SF',18.00,10.00,'28.00','Luxury'),
('Fixtures','Faucet','Moen','Align Series','Single Handle','Standard','Brushed Nickel','N/A','Each',185.00,65.00,'Allowance','Good'),
('Fixtures','Faucet','Delta','Trinsic Series','Pull-down','Standard','Matte Black','N/A','Each',385.00,85.00,'Allowance','Better'),
('Fixtures','Faucet','Brizo','Litze Series','Articulating','Standard','Unlacquered Brass','N/A','Each',785.00,115.00,'Allowance','Best'),
('Fixtures','Faucet','Waterworks','Custom Collection','Custom','Standard','Polished Gold','N/A','Each',null,null,'Per Quote','Luxury'),
('Doors and Trim','Interior Door','Masonite','Smooth 2-Panel','Two Panel Square','2/8 x 6/8','Primed','Colonial','Each',85.00,100.00,'185.00','Good'),
('Doors and Trim','Interior Door','Masonite','Smooth 2-Panel','Two Panel Arched','2/8 x 6/8','Primed','Craftsman','Each',110.00,120.00,'230.00','Better'),
('Doors and Trim','Interior Door','Steves and Sons','Solid Core Shaker','Shaker','2/8 x 8/0','White Pre-finished','Modern','Each',185.00,145.00,'330.00','Best'),
('Doors and Trim','Interior Door','TruStile','Custom Solid Wood','Custom Profile','3/0 x 8/0','Custom Finish','Traditional','Each',450.00,200.00,'650.00','Luxury'),
('Hardware','Pulls','Amerock','Everyday Basics','Bar Pull 3"','3" CC','Brushed Nickel','N/A','Each',4.50,3.00,'7.50','Good'),
('Hardware','Pulls','Rejuvenation','Schoolhouse Series','Cup Pull','3" CC','Matte Black','N/A','Each',18.00,3.00,'21.00','Better'),
('Hardware','Pulls','Top Knobs','Transcend Series','Bar Pull 5"','5" CC','Unlacquered Brass','N/A','Each',32.00,3.00,'35.00','Best'),
('Hardware','Pulls','Rocky Mountain Hardware','Custom Cast','Hand-forged','Custom','Oil-rubbed Bronze','N/A','Each',95.00,5.00,'100.00','Luxury');

-- Door variant seeds (for the first Masonite Good door)
-- To add variants: insert into catalog_variants (material_id, variant_type, variant_name, price_delta, notes)
-- using the id from the row above.
