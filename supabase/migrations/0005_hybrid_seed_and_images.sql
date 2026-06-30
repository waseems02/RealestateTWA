-- ============================================================================
-- 0005_hybrid_seed_and_images.sql
--
-- (a) Refresh listing_images: Tareq's seed gives every listing the same generic
--     photo. We cycle them through a varied pool of ~12 real apartment shots so
--     the cards visually feel different.
--
-- (b) Insert ~75 more hybrid-source demo listings at student-friendly prices
--     (rooms ₪1500–3500, apartments ₪3000–5500). Spread across all 14 campuses
--     in our DB, cycling through 5 demo source labels (yad2_demo,
--     facebook_group_demo, university_board_demo, public_source_demo,
--     manual_demo) so the hybrid-source story is visible in the UI.
--
-- Idempotent on contact_email LIKE 'hybrid-v2-%@example.com' — safe to re-run.
-- All source labels with the *_demo suffix are fake academic records; nothing
-- here was scraped from Yad2, Facebook, WhatsApp, or any protected source.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- (a) Refresh listing_images with a varied pool
-- ---------------------------------------------------------------------------

-- A pool of 12 realistic apartment / room photos from Unsplash (free use).
with image_pool (idx, url) as (
  values
    (0,  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
    (1,  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'),
    (2,  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
    (3,  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'),
    (4,  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
    (5,  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'),
    (6,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'),
    (7,  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'),
    (8,  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80'),
    (9,  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=80'),
    (10, 'https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1200&q=80'),
    (11, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')
),
ranked_listings as (
  select id, (row_number() over (order by id) - 1) % 12 as image_idx
  from public.listings
)
update public.listing_images li
set image_url = pool.url
from ranked_listings rl
join image_pool pool on pool.idx = rl.image_idx
where li.listing_id = rl.id;

-- ---------------------------------------------------------------------------
-- (b) Hybrid-source student-friendly seed
-- ---------------------------------------------------------------------------

-- Clean previous v2 inserts so the migration is idempotent.
delete from public.listing_images
where listing_id in (
  select id from public.listings
  where contact_email like 'hybrid-v2-%@example.com'
);
delete from public.listings
where contact_email like 'hybrid-v2-%@example.com';

with
  campus_grid (campus_id, city, neighborhood, base_lat, base_lng, base_room, base_apt) as (
    values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'Jerusalem',  'French Hill',          31.7982, 35.2427, 1800, 3200),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid, 'Jerusalem',  'Rehavia',              31.7745, 35.2142, 2200, 4400),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid, 'Tel Aviv',   'Ramat Aviv',           32.1139, 34.8027, 2800, 5200),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'::uuid, 'Haifa',      'Ahuza',                32.7770, 35.0003, 1500, 2900),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'::uuid, 'Be''er Sheva','Gimel',               31.2628, 34.7999, 1400, 2700),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'::uuid, 'Ramat Gan',  'Ramat Ilan',           32.0684, 34.8436, 2400, 4200),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7'::uuid, 'Ariel',      'Ariel Center',         32.1048, 35.2057, 1300, 2400),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8'::uuid, 'Herzliya',   'Herzliya Bet',         32.1668, 34.8123, 2700, 4900),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9'::uuid, 'Holon',      'Kiryat Sharet',        32.0170, 34.7780, 2100, 3900),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10'::uuid, 'Netanya',    'Kiryat Hasharon',      32.3075, 34.8796, 1900, 3700),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11'::uuid, 'Jerusalem',  'Romema',               31.7895, 35.1990, 1850, 3400),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12'::uuid, 'Jerusalem',  'Nachlaot',             31.7820, 35.2090, 2100, 4100),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa13'::uuid, 'Jerusalem',  'City Center',          31.7831, 35.2206, 2300, 4300),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa14'::uuid, 'Rehovot',    'Rehovot Science',      31.9072, 34.8089, 1700, 3100)
  ),
  room_titles (idx, t) as (
    values
      (0, 'חדר בדירת שותפים סטודנטים'),
      (1, 'חדר מרוהט במחיר סטודנטיאלי'),
      (2, 'חדר עם מרפסת בדירת שותפים'),
      (3, 'חדר נעים בדירה משותפת'),
      (4, 'חדר שקט מתאים ללימודים')
  ),
  apt_titles (idx, t) as (
    values
      (0, 'דירת 2 חדרים לסטודנטים'),
      (1, 'דירת 3 חדרים בקרבת הקמפוס'),
      (2, 'דירת סטודיו נעימה'),
      (3, 'דירה משופצת לזוג סטודנטים'),
      (4, 'דירה מרווחת לשותפים')
  ),
  sources (idx, src) as (
    values
      (0, 'yad2_demo'),
      (1, 'facebook_group_demo'),
      (2, 'university_board_demo'),
      (3, 'public_source_demo'),
      (4, 'manual_demo')
  ),
  generated as (
    select
      g.*,
      n,
      -- alternate room / apartment per row index
      case n % 2 when 0 then 'room' else 'apartment' end as ltype,
      sources.src as source,
      case n % 2
        when 0 then room_titles.t
        else apt_titles.t
      end as title_base
    from campus_grid g
    cross join generate_series(1, 6) as n
    join sources on sources.idx = (n - 1) % 5
    join room_titles on room_titles.idx = (n - 1) % 5
    join apt_titles  on apt_titles.idx  = (n - 1) % 5
  ),
  inserted_listings as (
    insert into public.listings (
      campus_id, title, description, listing_type, city, neighborhood, street,
      latitude, longitude, price, rooms, floor, size_sqm,
      balcony, elevator, parking, air_conditioning, furnished, pets_allowed,
      suitable_for_roommates, current_roommates_count, smoking_allowed,
      lifestyle_tradition_preference,
      distance_to_campus_km, distance_to_bus_station_m, distance_to_train_station_km,
      nearest_bus_station, nearest_train_station,
      available_from, contact_name, contact_phone, contact_email,
      source_type, status
    )
    select
      campus_id,
      title_base || ' · ' || neighborhood,
      'מודעה אקדמית לדמו בלבד — דירה/חדר טיפוסי באזור ' || neighborhood ||
        '. תקציב סטודנטיאלי, גישה נוחה לקמפוס ולתחבורה ציבורית.',
      ltype,
      city, neighborhood,
      'רחוב סטודנטים ' || n,
      round((base_lat + ((n - 3) * 0.0009))::numeric, 7),
      round((base_lng + ((n - 3) * 0.0011))::numeric, 7),
      case ltype
        when 'room' then base_room + (n * 80)        -- room: base + small step
        else base_apt + (n * 140)                    -- apt:  base + larger step
      end,
      case ltype
        when 'room' then 1.0
        else case n % 3 when 0 then 2.0 when 1 then 2.5 else 3.0 end
      end,
      ((n + 2) % 5) + 1,
      case ltype
        when 'room' then 12 + (n * 2)
        else 38 + (n * 7)
      end,
      n % 2 = 0,                                     -- balcony
      n % 3 = 0,                                     -- elevator
      n % 4 = 0,                                     -- parking
      true,                                          -- AC (most have)
      n % 3 <> 1,                                    -- furnished (~67%)
      n % 7 = 0,                                     -- pets
      ltype = 'room' or n % 3 = 0,                   -- suitable for roommates
      case ltype when 'room' then (n % 3) + 1 else case n % 3 when 0 then 0 else 1 end end,
      n % 9 = 0,                                     -- smoking (rare)
      null,                                          -- no lifestyle pref
      round((0.4 + ((n - 1) * 0.25))::numeric, 2),   -- 0.4 - 1.65 km to campus
      80 + (n * 25),                                 -- 105 - 230m to bus
      round((1.0 + ((n - 1) * 0.3))::numeric, 2),    -- 1.0 - 2.5 km to train
      'תחנה קרובה לקמפוס',
      'תחנת רכבת אזורית',
      current_date + (n * 4),
      'איש קשר דמו',
      '054-' || lpad((100 + n)::text, 3, '0') || '-' || lpad((1000 + n*7)::text, 4, '0'),
      'hybrid-v2-' || replace(lower(city), ' ', '-') || '-' || replace(lower(neighborhood), ' ', '-') || '-' || n || '@example.com',
      source,
      'active'
    from generated
    returning id
  ),
  image_pool_v2 (idx, url) as (
    values
      (0,  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
      (1,  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'),
      (2,  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
      (3,  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'),
      (4,  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
      (5,  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'),
      (6,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'),
      (7,  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'),
      (8,  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80'),
      (9,  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=80'),
      (10, 'https://images.unsplash.com/photo-1522444690501-d3cdef84a8c1?auto=format&fit=crop&w=1200&q=80'),
      (11, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')
  ),
  ranked_new as (
    select id, (row_number() over (order by id) - 1) % 12 as image_idx
    from inserted_listings
  )
insert into public.listing_images (listing_id, image_url, alt_text)
select rn.id, pool.url, 'תמונת דמו לדירה — לא תמונה מהנכס בפועל'
from ranked_new rn
join image_pool_v2 pool on pool.idx = rn.image_idx;
