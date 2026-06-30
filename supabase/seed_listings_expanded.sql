-- CampusNest Israel expanded demo seed data.
-- These are fake demo listings created for academic purposes only.
-- They are not scraped from Yad2, Facebook, WhatsApp groups, or any real private source.

alter table public.listings drop constraint if exists listings_source_type_check;
alter table public.listings
  add constraint listings_source_type_check
  check (source_type in ('manual_demo', 'university_board_demo', 'facebook_group_demo', 'yad2_demo', 'public_source_demo', 'manual_user'));

delete from public.listing_images
where listing_id in (
  select id from public.listings
  where contact_email like 'expanded-demo-%@example.com'
);

delete from public.listings
where contact_email like 'expanded-demo-%@example.com';

insert into public.universities (id, name_he, name_en, city) values
  ('11111111-1111-4111-8111-111111111111', 'האוניברסיטה העברית בירושלים', 'Hebrew University of Jerusalem', 'Jerusalem'),
  ('22222222-2222-4222-8222-222222222222', 'אוניברסיטת תל אביב', 'Tel Aviv University', 'Tel Aviv'),
  ('33333333-3333-4333-8333-333333333333', 'אוניברסיטת חיפה', 'University of Haifa', 'Haifa'),
  ('44444444-4444-4444-8444-444444444444', 'אוניברסיטת בן גוריון בנגב', 'Ben-Gurion University of the Negev', 'Beer Sheva'),
  ('55555555-5555-4555-8555-555555555555', 'אוניברסיטת בר אילן', 'Bar-Ilan University', 'Ramat Gan'),
  ('66666666-6666-4666-8666-666666666666', 'אוניברסיטת אריאל', 'Ariel University', 'Ariel'),
  ('77777777-7777-4777-8777-777777777777', 'אוניברסיטת רייכמן', 'Reichman University', 'Herzliya'),
  ('88888888-8888-4888-8888-888888888888', 'המכון הטכנולוגי חולון', 'Holon Institute of Technology', 'Holon'),
  ('99999999-9999-4999-8999-999999999999', 'המכללה האקדמית נתניה', 'Netanya Academic College', 'Netanya'),
  ('10101010-1010-4010-8010-101010101010', 'עזריאלי מכללה אקדמית להנדסה ירושלים', 'Azrieli College of Engineering Jerusalem', 'Jerusalem'),
  ('12121212-1212-4212-8212-121212121212', 'בצלאל אקדמיה לאמנות ועיצוב', 'Bezalel Academy of Arts and Design', 'Jerusalem'),
  ('13131313-1313-4313-8313-131313131313', 'המכללה האקדמית הדסה', 'Hadassah Academic College', 'Jerusalem')
on conflict (id) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  city = excluded.city;

insert into public.campuses (id, university_id, name_he, name_en, city, latitude, longitude) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'הר הצופים', 'Hebrew University Mount Scopus', 'Jerusalem', 31.7946000, 35.2419000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'גבעת רם', 'Hebrew University Givat Ram', 'Jerusalem', 31.7738000, 35.1975000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'הקמפוס המרכזי', 'Tel Aviv University Main Campus', 'Tel Aviv', 32.1133000, 34.8044000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '33333333-3333-4333-8333-333333333333', 'הקמפוס המרכזי', 'University of Haifa Main Campus', 'Haifa', 32.7615000, 35.0181000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '44444444-4444-4444-8444-444444444444', 'קמפוס משפחת מרקוס', 'Ben-Gurion University Marcus Family Campus', 'Beer Sheva', 31.2622000, 34.8015000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '55555555-5555-4555-8555-555555555555', 'הקמפוס המרכזי', 'Bar-Ilan University Main Campus', 'Ramat Gan', 32.0684000, 34.8436000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', '66666666-6666-4666-8666-666666666666', 'הקמפוס המרכזי', 'Ariel University Main Campus', 'Ariel', 32.1040000, 35.2077000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8', '77777777-7777-4777-8777-777777777777', 'קמפוס רייכמן', 'Reichman University Campus', 'Herzliya', 32.1668000, 34.8123000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', '88888888-8888-4888-8888-888888888888', 'קמפוס HIT', 'HIT Main Campus', 'Holon', 32.0170000, 34.7780000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10', '99999999-9999-4999-8999-999999999999', 'הקמפוס המרכזי', 'Netanya Academic College Main Campus', 'Netanya', 32.3075000, 34.8796000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', '10101010-1010-4010-8010-101010101010', 'קמפוס עזריאלי', 'Azrieli College Main Campus', 'Jerusalem', 31.7685000, 35.2043000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12', '12121212-1212-4212-8212-121212121212', 'קמפוס בצלאל', 'Bezalel Main Campus', 'Jerusalem', 31.7857000, 35.2007000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa13', '13131313-1313-4313-8313-131313131313', 'קמפוס מרכז העיר', 'Hadassah Academic College City Campus', 'Jerusalem', 31.7831000, 35.2206000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa14', '11111111-1111-4111-8111-111111111111', 'הפקולטה לחקלאות רחובות', 'Robert H. Smith Faculty of Agriculture Rehovot', 'Rehovot', 31.9072000, 34.8089000)
on conflict (id) do update set
  university_id = excluded.university_id,
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  city = excluded.city,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

with campus_profiles (
  campus_id, city, neighborhood, street, base_lat, base_lng, room_price, apartment_price,
  bus_station, train_station, train_km
) as (
  values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'Jerusalem', 'French Hill', 'אזור ההגנה', 31.7982, 35.2427, 2450, 5100, 'תחנת אוטובוס הר הצופים', 'הרכבת הקלה - גבעת התחמושת', 2.1),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid, 'Jerusalem', 'Rehavia', 'אזור עזה', 31.7745, 35.2142, 2850, 6400, 'תחנת אוטובוס גבעת רם', 'הרכבת הקלה - מרכז העיר', 1.6),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid, 'Tel Aviv', 'Ramat Aviv', 'אזור חיים לבנון', 32.1139, 34.8027, 3900, 7600, 'תחנת אוטובוס חיים לבנון', 'תחנת רכבת אוניברסיטה', 1.2),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'::uuid, 'Haifa', 'Ahuza', 'אזור חורב', 32.7770, 35.0003, 2100, 4300, 'תחנת אוטובוס אוניברסיטת חיפה', 'מרכזית חוף הכרמל', 4.2),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'::uuid, 'Beer Sheva', 'Gimel', 'אזור רגר', 31.2628, 34.7999, 1750, 3450, 'תחנת אוטובוס אוניברסיטת בן גוריון', 'תחנת רכבת באר שבע צפון', 1.1),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'::uuid, 'Ramat Gan', 'Ramat Ilan', 'אזור אלוף שדה', 32.0684, 34.8436, 2950, 5600, 'תחנת אוטובוס אוניברסיטת בר אילן', 'תחנת רכבת בני ברק', 2.7),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7'::uuid, 'Ariel', 'Ariel Center', 'אזור דרך הציונות', 32.1048, 35.2057, 1650, 2950, 'תחנת אוניברסיטת אריאל', 'תחנת רכבת ראש העין צפון', 13.0),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa14'::uuid, 'Rehovot', 'Rehovot Science', 'אזור הרצל', 31.9072, 34.8089, 2500, 4700, 'תחנת אוטובוס הפקולטה לחקלאות', 'תחנת רכבת רחובות', 1.4),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8'::uuid, 'Herzliya', 'Herzliya Bet', 'אזור כנפי נשרים', 32.1668, 34.8123, 3400, 6800, 'תחנת אוטובוס רייכמן', 'תחנת רכבת הרצליה', 2.2),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9'::uuid, 'Holon', 'Kiryat Sharet', 'אזור גולומב', 32.0170, 34.7780, 2600, 5000, 'תחנת אוטובוס HIT', 'תחנת רכבת קוממיות', 2.1),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10'::uuid, 'Netanya', 'Kiryat Hasharon', 'אזור האוניברסיטה', 32.3075, 34.8796, 2450, 4700, 'תחנת אוטובוס המכללה האקדמית נתניה', 'תחנת רכבת נתניה', 2.8),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12'::uuid, 'Jerusalem', 'Nachlaot', 'אזור בצלאל', 31.7820, 35.2090, 2750, 5900, 'תחנת אוטובוס בצלאל', 'הרכבת הקלה - מרכז העיר', 1.2)
),
expanded as (
  select
    p.*,
    n,
    case n % 2 when 1 then 'room' else 'apartment' end as listing_type,
    case n % 4
      when 0 then 'student_friendly'
      when 1 then 'no_preference'
      when 2 then 'quiet_lifestyle'
      else 'traditional_friendly'
    end as lifestyle_preference,
    (array['manual_demo', 'university_board_demo', 'facebook_group_demo', 'yad2_demo', 'public_source_demo'])[1 + (n % 5)] as demo_source
  from campus_profiles p
  cross join generate_series(1, 5) as n
)
insert into public.listings (
  campus_id, title, description, listing_type, city, neighborhood, street, latitude, longitude,
  price, rooms, floor, size_sqm, balcony, elevator, parking, air_conditioning, furnished,
  pets_allowed, suitable_for_roommates, current_roommates_count, smoking_allowed,
  lifestyle_tradition_preference, distance_to_campus_km, distance_to_bus_station_m,
  distance_to_train_station_km, nearest_bus_station, nearest_train_station,
  available_from, contact_name, contact_phone, contact_email, source_type, status
)
select
  campus_id,
  case
    when listing_type = 'room' then 'חדר מרוהט בדירת שותפים ליד הקמפוס'
    else 'דירת סטודנטים מתאימה לשותפים ליד תחבורה ציבורית'
  end || ' - ' || neighborhood,
  'מודעת דמו אקדמית בלבד. הנכס מדמה מידע טיפוסי לסטודנטים באזור ' || neighborhood ||
    ', כולל מרחק לקמפוס, תחנות אוטובוס ורכבת, ומאפייני דירה שימושיים.',
  listing_type,
  city,
  neighborhood,
  street || ' ' || n,
  round((base_lat + ((n - 3) * 0.0011))::numeric, 7),
  round((base_lng + ((n - 3) * 0.0013))::numeric, 7),
  case when listing_type = 'room' then room_price + (n * 90) else apartment_price + (n * 180) end,
  case when listing_type = 'room' then 1.0 else case n % 3 when 0 then 2.5 when 1 then 3.0 else 4.0 end end,
  (n % 6) + 1,
  case when listing_type = 'room' then 13 + n else 42 + (n * 8) end,
  n % 2 = 0,
  n % 3 = 0,
  n % 4 = 0,
  true,
  listing_type = 'room' or n % 3 <> 0,
  n % 5 = 0,
  listing_type = 'room' or n % 2 = 0,
  case when listing_type = 'room' then (n % 3) + 1 when n % 2 = 0 then 0 else 2 end,
  n % 6 = 0,
  lifestyle_preference,
  round((0.35 + (n * 0.28))::numeric, 2),
  70 + (n * 35),
  round((train_km + (n * 0.12))::numeric, 2),
  bus_station,
  train_station,
  current_date + (n * 7),
  'איש קשר דמו',
  '050-700' || lpad(n::text, 4, '0'),
  'expanded-demo-' || replace(lower(city), ' ', '-') || '-' || replace(lower(neighborhood), ' ', '-') || '-' || n || '@example.com',
  demo_source,
  'active'
from expanded;

insert into public.listing_images (listing_id, image_url, alt_text)
select
  id,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'תמונת דמו לדירה - לא תמונה מהנכס'
from public.listings
where contact_email like 'expanded-demo-%@example.com'
on conflict do nothing;
