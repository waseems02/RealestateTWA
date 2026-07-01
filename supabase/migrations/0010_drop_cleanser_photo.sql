-- ============================================================================
-- 0010_drop_cleanser_photo.sql
--
-- The 0009 pool still included one bad ID — photo-1556228720-195a672e8a03
-- is actually a cleanser bottle, not a bedroom. Any listing_images row
-- pointing to it is remapped to a safer, verified interior photo, using a
-- deterministic hash so the same listing consistently gets the same
-- replacement (not a random flip on every re-run).
--
-- Idempotent: safe to re-run.
-- ============================================================================

with replacements (idx, url) as (
  values
    (0, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80'),
    (1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'),
    (2, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80'),
    (3, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80')
),
targets as (
  select li.id,
         (abs(hashtext(li.id::text)) % 4) as pick
  from public.listing_images li
  where li.image_url like '%1556228720-195a672e8a03%'
)
update public.listing_images li
set image_url = r.url,
    alt_text = 'תמונת דמו של דירה — לא תמונה מהנכס בפועל'
from targets t
join replacements r on r.idx = t.pick
where li.id = t.id;
