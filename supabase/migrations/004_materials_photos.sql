-- 004_materials_photos.sql
-- Populate image_url for all materials using category-matched Unsplash images.
-- Run after 003_materials_catalog.sql.

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  WHERE category = 'lvp_hardwood_flooring';

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'
  WHERE category IN ('bathroom_floor_tile', 'shower_wall_tile', 'shower_floor_tile');

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'
  WHERE category = 'shower_doors';

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'
  WHERE category = 'toilets';

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'
  WHERE category = 'vanities';

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80'
  WHERE category IN ('bathroom_faucets', 'bath_accessories');

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80'
  WHERE category IN ('bar_kitchen_cabinets', 'medicine_cabinets');

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'
  WHERE category IN ('countertops', 'bar_sinks');

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80'
  WHERE category = 'lighting';

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  WHERE category IN ('interior_doors', 'egress_windows');

UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80'
  WHERE category = 'paint';

-- Fallback: any remaining rows without a photo get a neutral construction image
UPDATE materials SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  WHERE image_url IS NULL;
