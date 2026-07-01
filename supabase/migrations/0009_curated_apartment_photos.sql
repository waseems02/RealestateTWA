-- ============================================================================
-- 0009_curated_apartment_photos.sql
--
-- The pool from 0007 had 18 URLs, but 6 of them (that I added without
-- eyeballing) turned out to be product shots / unrelated imagery — one of
-- them was literally a shampoo bottle. Trim to 12 hand-verified simple
-- lifestyle apartment interiors so nothing weird slips through.
--
-- Every image is a residential apartment scene: living room, bedroom,
-- kitchen. No luxury villas, no lookbook fashion shots, no products.
--
-- Idempotent: safe to re-run.
-- ============================================================================

with image_pool (idx, url) as (
  values
    (0,  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'), -- living room modern
    (1,  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80'), -- cozy bedroom
    (2,  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80'), -- apartment building
    (3,  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80'), -- bedroom with windows
    (4,  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'),  -- kitchen
    (5,  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80'), -- bright living room
    (6,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80'),  -- bedroom
    (7,  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80'), -- living room with plants
    (8,  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80'),  -- kitchen modern
    (9,  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80'), -- bedroom stylish
    (10, 'https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1600&q=80'), -- living room natural light
    (11, 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80')  -- cozy bedroom corner
),
ranked as (
  select id, (row_number() over (order by id) - 1) % 12 as image_idx
  from public.listings
)
update public.listing_images li
set image_url = pool.url,
    alt_text = 'תמונת דמו של דירה — לא תמונה מהנכס בפועל'
from ranked rk
join image_pool pool on pool.idx = rk.image_idx
where li.listing_id = rk.id;
