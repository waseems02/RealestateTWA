-- Sample listings + university joins for development.
-- Idempotent: dedupes on (source, external_id) via the partial unique index.
-- Safe to re-run; existing seeded rows are upserted by their seed_ external_id.

with
  uni as (select id, name_en from public.universities),
  inserted as (
    insert into public.listings (
      title, description, price_nis, size_sqm, rooms, floor,
      has_balcony, pets_allowed, smoking_allowed, furnished,
      parking_available, air_conditioning, accessible,
      lease_months, available_from,
      bus_stop_distance_m, train_station_distance_m, nearest_supermarket_m,
      num_roommates, roommates_status, roommates_religious_tag, gender_preference,
      noise_level, safety_rating,
      city, neighborhood, latitude, longitude,
      source, external_id
    ) values
      -- Tel Aviv area, near TAU & Reichman
      ('דירת 3 חדרים עם מרפסת ברמת אביב',
       'דירה מוארת קומה 3 עם מרפסת גדולה, ליד הקמפוס הצפוני של תל אביב.',
       6200, 75, 3, 3, true, false, false, 'full',
       true, true, false, 12, current_date,
       150, 1200, 400,
       2, 'student', 'secular', 'any',
       2, 4, 'Tel Aviv', 'Ramat Aviv', 32.1130, 34.8050, 'manual', 'seed_001'),

      ('סטודיו ליד אוניברסיטת תל אביב',
       'סטודיו קטן ושקט, מתאים לסטודנט בודד.',
       3800, 32, 1, 1, false, false, false, 'partial',
       false, true, true, 12, current_date,
       80, 1500, 200,
       0, null, null, 'any',
       3, 4, 'Tel Aviv', 'Ramat Aviv', 32.1140, 34.8090, 'manual', 'seed_002'),

      ('חדר בדירת שותפים בפלורנטין',
       'חדר פרטי בדירת 4 חדרים, אווירה צעירה, ליד הקווים.',
       2900, 18, 4, 2, true, true, true, 'full',
       false, true, false, 12, current_date,
       100, 800, 250,
       3, 'mixed', 'secular', 'any',
       4, 3, 'Tel Aviv', 'Florentin', 32.0570, 34.7700, 'manual', 'seed_003'),

      -- Jerusalem near HUJI, Bezalel
      ('דירת 2 חדרים ברחביה',
       'דירה שקטה ברחביה, קרובה לקמפוס גבעת רם.',
       4200, 55, 2, 2, true, false, false, 'partial',
       true, true, false, 12, current_date + interval '14 days',
       120, 5000, 350,
       1, 'student', 'traditional', 'female',
       2, 4, 'Jerusalem', 'Rehavia', 31.7780, 35.2120, 'manual', 'seed_004'),

      ('חדר בדירה בנחלאות לבנות בלבד',
       'חדר בדירת 3 שותפות דתיות, קרוב לבצלאל.',
       2600, 14, 3, 1, false, false, false, 'full',
       false, false, false, 12, current_date,
       60, 3500, 150,
       2, 'student', 'religious', 'female',
       3, 4, 'Jerusalem', 'Nachlaot', 31.7820, 35.2150, 'manual', 'seed_005'),

      -- Haifa near Technion + University of Haifa
      ('דירת 4 חדרים ליד הטכניון',
       'דירה גדולה בנווה שאנן, חניה ומרפסת, נגישה.',
       4800, 95, 4, 0, true, true, false, 'full',
       true, true, true, 12, current_date,
       70, 4000, 300,
       2, 'student', 'mixed', 'any',
       2, 5, 'Haifa', 'Neve Shaanan', 32.7770, 35.0220, 'manual', 'seed_006'),

      ('סטודיו בהר הכרמל',
       'סטודיו קומה 5 עם נוף לים, ליד אוניברסיטת חיפה.',
       3400, 38, 1, 5, true, false, false, 'partial',
       false, true, false, 12, current_date + interval '30 days',
       200, 6500, 500,
       0, null, null, 'any',
       1, 4, 'Haifa', 'Carmel', 32.7620, 35.0200, 'manual', 'seed_007'),

      -- Beer Sheva near BGU
      ('חדר בדירת סטודנטים ברובע ב באר שבע',
       'חדר בדירת 4 שותפים, ליד הקמפוס.',
       1800, 16, 4, 2, false, false, true, 'full',
       true, true, false, 12, current_date,
       50, 800, 100,
       3, 'student', 'secular', 'any',
       4, 3, 'Beer Sheva', 'Daled', 31.2630, 34.8000, 'manual', 'seed_008'),

      ('דירת 2.5 חדרים ליד אוניברסיטת בן-גוריון',
       'דירה משופצת, מרפסת קטנה.',
       3200, 50, 2.5, 1, true, true, false, 'full',
       false, true, false, 12, current_date,
       90, 1100, 200,
       1, 'mixed', 'secular', 'any',
       3, 3, 'Beer Sheva', 'Neighborhood Aleph', 31.2615, 34.8020, 'manual', 'seed_009'),

      -- Ramat Gan / Bar-Ilan
      ('חדר בדירה דתית ליד בר-אילן',
       'חדר בדירת 3 שותפים, סביבה דתית, ליד הקמפוס.',
       2400, 14, 3, 3, false, false, false, 'full',
       true, true, false, 12, current_date,
       80, 2000, 150,
       2, 'student', 'religious', 'male',
       2, 5, 'Ramat Gan', 'Givat Shmuel border', 32.0710, 34.8410, 'manual', 'seed_010'),

      -- Herzliya / Reichman
      ('דירת 3 חדרים ברעננה לסטודנטים',
       'דירת 3 חדרים, גישה נוחה לרייכמן ולרכבת.',
       5400, 78, 3, 2, true, false, false, 'full',
       true, true, false, 12, current_date,
       100, 600, 400,
       2, 'mixed', 'secular', 'any',
       2, 5, 'Raanana', 'City Center', 32.1820, 34.8940, 'manual', 'seed_011'),

      -- Holon / HIT
      ('סטודיו בחולון ליד HIT',
       'סטודיו מודרני, חניה, נגיש.',
       3000, 30, 1, 0, false, false, false, 'full',
       true, true, true, 12, current_date,
       60, 1800, 250,
       0, null, null, 'any',
       3, 4, 'Holon', 'City Center', 32.0180, 34.7790, 'manual', 'seed_012')
    on conflict (source, external_id) where external_id is not null
    do update set
      title = excluded.title,
      description = excluded.description,
      price_nis = excluded.price_nis,
      is_active = true
    returning id, external_id
  )
-- Junction rows: pair each seeded listing with its 1–2 nearest universities
insert into public.listing_universities (listing_id, university_id, distance_m)
select i.id, u.id, dist::int
from inserted i
join (values
  ('seed_001', 'Tel Aviv University', 350),
  ('seed_002', 'Tel Aviv University', 200),
  ('seed_003', 'Tel Aviv University', 3500),
  ('seed_004', 'Hebrew University of Jerusalem', 1800),
  ('seed_004', 'Bezalel Academy', 800),
  ('seed_005', 'Bezalel Academy', 350),
  ('seed_005', 'Hebrew University of Jerusalem', 2200),
  ('seed_006', 'Technion', 250),
  ('seed_007', 'University of Haifa', 600),
  ('seed_008', 'Ben-Gurion University', 250),
  ('seed_009', 'Ben-Gurion University', 400),
  ('seed_010', 'Bar-Ilan University', 200),
  ('seed_011', 'Reichman University', 4500),
  ('seed_011', 'Open University of Israel', 800),
  ('seed_012', 'Holon Institute of Technology', 300)
) as t(ext_id, uni_en, dist) on t.ext_id = i.external_id
join uni u on u.name_en = t.uni_en
on conflict (listing_id, university_id)
do update set distance_m = excluded.distance_m;
