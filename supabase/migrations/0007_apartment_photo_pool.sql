-- ============================================================================
-- 0007_apartment_photo_pool.sql
--
-- Migration 0006 switched to picsum.photos, which returns random photos
-- (cats, landscapes, sunsets) — not apartments. Bad for a listings site.
--
-- This migration cycles every listing through a curated pool of 18 real
-- apartment / bedroom / kitchen Unsplash photos, deterministically by
-- listing id order. Every listing gets a different photo, and every photo
-- is an actual interior/exterior of an apartment or a room.
--
-- Idempotent: safe to re-run, only touches listing_images.
-- ============================================================================

with image_pool (idx, url) as (
  values
    (0,  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'),
    (1,  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80'),
    (2,  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80'),
    (3,  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80'),
    (4,  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'),
    (5,  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80'),
    (6,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80'),
    (7,  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80'),
    (8,  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80'),
    (9,  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80'),
    (10, 'https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1600&q=80'),
    (11, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80'),
    (12, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80'),
    (13, 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80'),
    (14, 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1600&q=80'),
    (15, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80'),
    (16, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80'),
    (17, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')
),
ranked as (
  select id, (row_number() over (order by id) - 1) % 18 as image_idx
  from public.listings
)
update public.listing_images li
set image_url = pool.url,
    alt_text = 'תמונת דמו של דירה — לא תמונה מהנכס בפועל'
from ranked rk
join image_pool pool on pool.idx = rk.image_idx
where li.listing_id = rk.id;
