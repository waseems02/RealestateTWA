-- CampusNest Israel - complete Supabase database setup
-- Run this whole file once in the Supabase SQL Editor.
-- Demo source labels such as yad2_demo and facebook_group_demo are fake academic records only.
-- No data in this file was scraped from Yad2, Facebook, or any protected/private source.

-- 1. Extensions
create extension if not exists pgcrypto;

-- 2. Drop existing objects safely
drop table if exists public.admin_actions cascade;
drop table if exists public.reports cascade;
drop table if exists public.telegram_messages cascade;
drop table if exists public.telegram_users cascade;
drop table if exists public.ai_recommendations cascade;
drop table if exists public.ai_messages cascade;
drop table if exists public.ai_conversations cascade;
drop table if exists public.messages cascade;
drop table if exists public.favorites cascade;
drop table if exists public.roommate_matches cascade;
drop table if exists public.roommate_preferences cascade;
drop table if exists public.listing_images cascade;
drop table if exists public.listings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.campuses cascade;
drop table if exists public.universities cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.is_admin(uuid) cascade;

-- 3. Create tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  university_id uuid,
  campus_id uuid,
  city text,
  preferred_language text not null default 'he' check (preferred_language in ('he', 'en')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name_he text not null,
  name_en text not null,
  city text not null,
  created_at timestamptz default now()
);

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name_he text not null,
  name_en text not null,
  city text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz default now()
);

alter table public.profiles
  add constraint profiles_university_id_fkey
  foreign key (university_id) references public.universities(id) on delete set null;

alter table public.profiles
  add constraint profiles_campus_id_fkey
  foreign key (campus_id) references public.campuses(id) on delete set null;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  title text not null,
  description text,
  listing_type text not null check (listing_type in ('apartment', 'room')),
  city text not null,
  neighborhood text,
  street text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  price numeric(10,2) not null check (price >= 0),
  rooms numeric(4,1),
  floor integer,
  size_sqm numeric(6,2),
  balcony boolean default false,
  elevator boolean default false,
  parking boolean default false,
  air_conditioning boolean default false,
  furnished boolean default false,
  pets_allowed boolean default false,
  suitable_for_roommates boolean default false,
  current_roommates_count integer default 0 check (current_roommates_count >= 0),
  smoking_allowed boolean default false,
  lifestyle_tradition_preference text,
  distance_to_campus_km numeric(5,2),
  distance_to_bus_station_m integer,
  distance_to_train_station_km numeric(5,2),
  nearest_bus_station text,
  nearest_train_station text,
  available_from date,
  contact_name text,
  contact_phone text,
  contact_email text,
  source_type text not null default 'manual_demo' check (source_type in ('manual_demo', 'university_board_demo', 'facebook_group_demo', 'yad2_demo', 'manual_user')),
  status text not null default 'active' check (status in ('active', 'pending', 'rented', 'hidden')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column public.listings.lifestyle_tradition_preference is
  'Optional self-declared lifestyle/tradition preference. Not mandatory and must not be used for discriminatory filtering.';

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  alt_text text,
  created_at timestamptz default now()
);

create table public.roommate_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  preferred_city text,
  preferred_neighborhood text,
  preferred_campus_id uuid references public.campuses(id) on delete set null,
  smoking_preference text default 'no_preference' check (smoking_preference in ('no_smoking', 'smoking_ok', 'no_preference')),
  pets_preference text default 'no_preference' check (pets_preference in ('pets_ok', 'no_pets', 'no_preference')),
  cleanliness_level integer check (cleanliness_level between 1 and 5),
  quiet_level integer check (quiet_level between 1 and 5),
  lifestyle_tradition_preference text,
  move_in_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.roommate_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  matched_user_id uuid not null references public.profiles(id) on delete cascade,
  match_score integer not null check (match_score between 0 and 100),
  match_reason text,
  status text not null default 'suggested' check (status in ('suggested', 'saved', 'rejected', 'contacted')),
  created_at timestamptz default now(),
  unique (user_id, matched_user_id),
  check (user_id <> matched_user_id)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, listing_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  receiver_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  message_text text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  recommendation_reason text,
  match_score integer check (match_score between 0 and 100),
  created_at timestamptz default now()
);

create table public.telegram_users (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  telegram_user_id text unique not null,
  telegram_username text,
  chat_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.telegram_messages (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id uuid not null references public.telegram_users(id) on delete cascade,
  message_text text not null,
  direction text not null check (direction in ('incoming', 'outgoing')),
  created_at timestamptz default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  target_table text,
  target_id uuid,
  notes text,
  created_at timestamptz default now()
);

-- 4. Helper functions
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- 5. updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 6. Triggers
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create trigger set_roommate_preferences_updated_at
before update on public.roommate_preferences
for each row execute function public.set_updated_at();

create trigger set_ai_conversations_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

create trigger set_telegram_users_updated_at
before update on public.telegram_users
for each row execute function public.set_updated_at();

create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- 7. Indexes
create index listings_city_idx on public.listings (city);
create index listings_price_idx on public.listings (price);
create index listings_campus_id_idx on public.listings (campus_id);
create index listings_status_idx on public.listings (status);
create index listings_listing_type_idx on public.listings (listing_type);
create index listings_distance_to_campus_idx on public.listings (distance_to_campus_km);
create index listings_lat_lng_idx on public.listings (latitude, longitude);
create index favorites_user_id_idx on public.favorites (user_id);
create index roommate_matches_user_id_idx on public.roommate_matches (user_id);
create index roommate_matches_matched_user_id_idx on public.roommate_matches (matched_user_id);
create index ai_conversations_user_id_idx on public.ai_conversations (user_id);
create index telegram_users_telegram_user_id_idx on public.telegram_users (telegram_user_id);

-- Data API grants. RLS below still controls row access.
grant usage on schema public to anon, authenticated;
grant select on public.universities, public.campuses, public.listings, public.listing_images to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 8. Enable RLS
alter table public.profiles enable row level security;
alter table public.universities enable row level security;
alter table public.campuses enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.roommate_preferences enable row level security;
alter table public.roommate_matches enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.telegram_users enable row level security;
alter table public.telegram_messages enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;

-- 9. RLS policies
create policy "universities are readable by anyone"
on public.universities for select
to anon, authenticated
using (true);

create policy "campuses are readable by anyone"
on public.campuses for select
to anon, authenticated
using (true);

create policy "users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id and role = 'student');

create policy "users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id and role = 'student');

create policy "admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin((select auth.uid())));

create policy "active listings are readable by anyone"
on public.listings for select
to anon, authenticated
using (status = 'active');

create policy "authenticated users can insert own listings"
on public.listings for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "users can update own listings"
on public.listings for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "admins can update all listings"
on public.listings for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

create policy "images for active listings are readable by anyone"
on public.listing_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.status = 'active'
  )
);

create policy "listing owners can insert images"
on public.listing_images for insert
to authenticated
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = (select auth.uid())
  )
);

create policy "listing owners can update images"
on public.listing_images for update
to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = (select auth.uid())
  )
);

create policy "listing owners can delete images"
on public.listing_images for delete
to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = (select auth.uid())
  )
);

create policy "users can manage own roommate preferences"
on public.roommate_preferences for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users can read their roommate matches"
on public.roommate_matches for select
to authenticated
using ((select auth.uid()) = user_id or (select auth.uid()) = matched_user_id);

create policy "users can manage own favorites"
on public.favorites for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users can read own messages"
on public.messages for select
to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);

create policy "users can insert messages as sender"
on public.messages for insert
to authenticated
with check (sender_id = (select auth.uid()));

create policy "users can manage own ai conversations"
on public.ai_conversations for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users can read ai messages in own conversations"
on public.ai_messages for select
to authenticated
using (
  exists (
    select 1 from public.ai_conversations
    where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = (select auth.uid())
  )
);

create policy "users can insert ai messages in own conversations"
on public.ai_messages for insert
to authenticated
with check (
  exists (
    select 1 from public.ai_conversations
    where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = (select auth.uid())
  )
);

create policy "users can read own ai recommendations"
on public.ai_recommendations for select
to authenticated
using (user_id = (select auth.uid()));

create policy "users can read own linked telegram record"
on public.telegram_users for select
to authenticated
using (profile_id = (select auth.uid()));

create policy "users can update own linked telegram record"
on public.telegram_users for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "users can read own telegram messages"
on public.telegram_messages for select
to authenticated
using (
  exists (
    select 1 from public.telegram_users
    where telegram_users.id = telegram_messages.telegram_user_id
      and telegram_users.profile_id = (select auth.uid())
  )
);

create policy "authenticated users can insert reports"
on public.reports for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy "users can read own reports"
on public.reports for select
to authenticated
using (reporter_id = (select auth.uid()));

create policy "admins can manage all reports"
on public.reports for all
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

create policy "admins can read admin actions"
on public.admin_actions for select
to authenticated
using (public.is_admin((select auth.uid())));

create policy "admins can insert admin actions"
on public.admin_actions for insert
to authenticated
with check (public.is_admin((select auth.uid())));

-- 10. Demo seed data
-- These records are fake demo records for academic use only. They are not scraped.

insert into public.universities (id, name_he, name_en, city) values
  ('11111111-1111-4111-8111-111111111111', 'האוניברסיטה העברית בירושלים', 'Hebrew University of Jerusalem', 'Jerusalem'),
  ('22222222-2222-4222-8222-222222222222', 'אוניברסיטת תל אביב', 'Tel Aviv University', 'Tel Aviv'),
  ('33333333-3333-4333-8333-333333333333', 'אוניברסיטת חיפה', 'University of Haifa', 'Haifa'),
  ('44444444-4444-4444-8444-444444444444', 'אוניברסיטת בן גוריון בנגב', 'Ben-Gurion University of the Negev', 'Be''er Sheva'),
  ('55555555-5555-4555-8555-555555555555', 'אוניברסיטת בר אילן', 'Bar-Ilan University', 'Ramat Gan'),
  ('66666666-6666-4666-8666-666666666666', 'אוניברסיטת אריאל', 'Ariel University', 'Ariel');

insert into public.campuses (id, university_id, name_he, name_en, city, latitude, longitude) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'הר הצופים', 'Hebrew University Mount Scopus', 'Jerusalem', 31.7946000, 35.2419000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'גבעת רם', 'Hebrew University Givat Ram', 'Jerusalem', 31.7738000, 35.1975000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'הקמפוס המרכזי', 'Tel Aviv University Main Campus', 'Tel Aviv', 32.1133000, 34.8044000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '33333333-3333-4333-8333-333333333333', 'הקמפוס המרכזי', 'University of Haifa Main Campus', 'Haifa', 32.7615000, 35.0181000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '44444444-4444-4444-8444-444444444444', 'קמפוס משפחת מרקוס', 'Ben-Gurion University Marcus Family Campus', 'Be''er Sheva', 31.2622000, 34.8015000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '55555555-5555-4555-8555-555555555555', 'הקמפוס המרכזי', 'Bar-Ilan University Main Campus', 'Ramat Gan', 32.0684000, 34.8436000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', '66666666-6666-4666-8666-666666666666', 'הקמפוס המרכזי', 'Ariel University Main Campus', 'Ariel', 32.1040000, 35.2077000);

insert into public.listings (
  campus_id, title, description, listing_type, city, neighborhood, street, latitude, longitude,
  price, rooms, floor, size_sqm, balcony, elevator, parking, air_conditioning, furnished,
  pets_allowed, suitable_for_roommates, current_roommates_count, smoking_allowed,
  lifestyle_tradition_preference, distance_to_campus_km, distance_to_bus_station_m,
  distance_to_train_station_km, nearest_bus_station, nearest_train_station,
  available_from, contact_name, contact_phone, contact_email, source_type, status
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'חדר מואר ליד הר הצופים', 'חדר בדירת שותפים שקטה, מתאים לסטודנטים. מודעת דמו בלבד.', 'room', 'Jerusalem', 'French Hill', 'רחוב דמו 1', 31.7982000, 35.2427000, 2450, 1.0, 2, 18, true, false, false, true, true, false, true, 2, false, null, 0.90, 180, 2.40, 'תחנת הגבעה הצרפתית', 'רכבת קלה גבעת המבתר', current_date + 10, 'דמו קשר', '050-0000001', 'demo1@example.com', 'university_board_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'דירת שני חדרים קרובה לקמפוס', 'דירה קטנה ומסודרת עם תחבורה נוחה. נתון אקדמי דמיוני.', 'apartment', 'Jerusalem', 'French Hill', 'רחוב דמו 2', 31.7960000, 35.2389000, 3900, 2.0, 1, 42, false, false, true, true, false, false, false, 0, false, null, 1.10, 120, 2.10, 'תחנת האצ"ל', 'רכבת קלה גבעת המבתר', current_date + 20, 'דמו קשר', '050-0000002', 'demo2@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'חדר בנחלאות לסטודנטים', 'חדר בדירה נעימה עם גישה טובה לגבעת רם. מקור דמו.', 'room', 'Jerusalem', 'Nachlaot', 'רחוב דמו 3', 31.7820000, 35.2090000, 2700, 1.0, 3, 16, false, false, false, true, true, false, true, 3, false, 'אופציונלי בלבד', 2.00, 90, 1.30, 'תחנת בצלאל', 'רכבת קלה יפו מרכז', current_date + 15, 'דמו קשר', '050-0000003', 'demo3@example.com', 'facebook_group_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'דירת שותפים ברחביה', 'דירה מרווחת עם סלון גדול, מתאימה לשלושה שותפים.', 'apartment', 'Jerusalem', 'Rehavia', 'רחוב דמו 4', 31.7745000, 35.2142000, 6200, 3.5, 2, 78, true, false, false, true, true, false, true, 2, false, null, 1.70, 140, 1.60, 'תחנת עזה', 'רכבת קלה יפו מרכז', current_date + 30, 'דמו קשר', '050-0000004', 'demo4@example.com', 'yad2_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'חדר ברמת אביב ליד האוניברסיטה', 'חדר מרוהט בדירת שותפים קרובה מאוד לקמפוס.', 'room', 'Tel Aviv', 'Ramat Aviv', 'רחוב דמו 5', 32.1139000, 34.8027000, 3600, 1.0, 4, 14, false, true, false, true, true, true, true, 2, false, null, 0.70, 110, 2.80, 'תחנת חיים לבנון', 'תחנת אוניברסיטה', current_date + 7, 'דמו קשר', '050-0000005', 'demo5@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'דירת שני חדרים בצפון הישן', 'דירה קומפקטית עם תחבורה נוחה לאוניברסיטה.', 'apartment', 'Tel Aviv', 'Old North', 'רחוב דמו 6', 32.0879000, 34.7810000, 5400, 2.0, 3, 44, true, false, false, true, false, false, false, 0, false, null, 3.40, 80, 1.90, 'תחנת דיזנגוף', 'תחנת סבידור מרכז', current_date + 25, 'דמו קשר', '050-0000006', 'demo6@example.com', 'facebook_group_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'חדר בפלורנטין עם שותפים', 'מתאים לסטודנטים שרוצים חיי עיר ותחבורה זמינה.', 'room', 'Tel Aviv', 'Florentin', 'רחוב דמו 7', 32.0558000, 34.7668000, 3150, 1.0, 2, 13, false, false, false, true, true, false, true, 3, true, null, 6.20, 130, 0.90, 'תחנת העלייה', 'תחנת ההגנה', current_date + 18, 'דמו קשר', '050-0000007', 'demo7@example.com', 'yad2_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'חדר באחוזה קרוב לאוניברסיטת חיפה', 'חדר שקט עם נוף, מתאים ללימודים.', 'room', 'Haifa', 'Ahuza', 'רחוב דמו 8', 32.7770000, 35.0003000, 2200, 1.0, 1, 15, true, false, true, true, true, false, true, 2, false, null, 2.10, 160, 4.20, 'תחנת חורב', 'מרכזית חוף הכרמל', current_date + 12, 'דמו קשר', '050-0000008', 'demo8@example.com', 'university_board_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'דירה קטנה בהדר', 'דירת סטודיו במחיר נוח עם אוטובוסים לקמפוס.', 'apartment', 'Haifa', 'Hadar', 'רחוב דמו 9', 32.8120000, 34.9980000, 2800, 1.5, 2, 32, false, false, false, true, false, false, false, 0, false, null, 5.80, 100, 1.20, 'תחנת הנביאים', 'תחנת חיפה מרכז', current_date + 40, 'דמו קשר', '050-0000009', 'demo9@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'דירת שלושה חדרים בנוה שאנן', 'מתאימה לשני שותפים, תחבורה ישירה לטכניון ולאוניברסיטה.', 'apartment', 'Haifa', 'Neve Shaanan', 'רחוב דמו 10', 32.7861000, 35.0153000, 4100, 3.0, 5, 68, true, true, false, true, true, true, true, 1, false, null, 3.50, 210, 3.80, 'תחנת נוה שאנן', 'מרכזית המפרץ', current_date + 22, 'דמו קשר', '050-0000010', 'demo10@example.com', 'facebook_group_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'חדר בשכונה ג ליד בן גוריון', 'חדר בדירת שותפים ליד הקמפוס וסורוקה.', 'room', 'Be''er Sheva', 'Gimel', 'רחוב דמו 11', 31.2628000, 34.7999000, 1900, 1.0, 1, 12, false, false, false, true, true, false, true, 2, false, null, 0.50, 70, 1.40, 'תחנת רגר', 'באר שבע צפון אוניברסיטה', current_date + 5, 'דמו קשר', '050-0000011', 'demo11@example.com', 'university_board_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'דירת שני חדרים בשכונה ד', 'דירה פשוטה במחיר סטודנטיאלי, נתוני דמו בלבד.', 'apartment', 'Be''er Sheva', 'Dalet', 'רחוב דמו 12', 31.2660000, 34.7900000, 2600, 2.0, 3, 45, false, false, true, true, false, true, false, 0, false, null, 1.20, 150, 1.80, 'תחנת וינגייט', 'באר שבע צפון אוניברסיטה', current_date + 14, 'דמו קשר', '050-0000012', 'demo12@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'חדר משופץ ליד סורוקה', 'מתאים לסטודנטים לרפואה או מדעי הבריאות.', 'room', 'Be''er Sheva', 'Gimel', 'רחוב דמו 13', 31.2589000, 34.8011000, 2050, 1.0, 2, 13, true, false, false, true, true, false, true, 1, false, null, 0.80, 60, 1.10, 'תחנת סורוקה', 'באר שבע צפון אוניברסיטה', current_date + 9, 'דמו קשר', '050-0000013', 'demo13@example.com', 'yad2_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'חדר בגבעת שמואל ליד בר אילן', 'חדר מרוהט בדירה נקייה עם שותפים שקטים.', 'room', 'Ramat Gan', 'Givat Shmuel', 'רחוב דמו 14', 32.0750000, 34.8493000, 2800, 1.0, 4, 14, false, true, false, true, true, false, true, 2, false, 'אופציונלי בלבד', 0.90, 100, 3.00, 'תחנת גבעת שמואל', 'תחנת בני ברק', current_date + 11, 'דמו קשר', '050-0000014', 'demo14@example.com', 'facebook_group_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'דירת שלושה חדרים ברמת גן', 'דירה מרווחת לזוג או שותפים, תחבורה טובה לקמפוס.', 'apartment', 'Ramat Gan', 'Ramat Ilan', 'רחוב דמו 15', 32.0679000, 34.8398000, 5200, 3.0, 6, 70, true, true, true, true, false, false, true, 0, false, null, 1.00, 180, 2.70, 'תחנת אלוף שדה', 'תחנת בני ברק', current_date + 28, 'דמו קשר', '050-0000015', 'demo15@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'סטודיו קטן ברמת גן', 'מתאים לסטודנט יחיד, קרוב לקווי אוטובוס.', 'apartment', 'Ramat Gan', 'Ramat Gan Center', 'רחוב דמו 16', 32.0820000, 34.8142000, 3300, 1.5, 1, 28, false, false, false, true, true, false, false, 0, false, null, 3.30, 90, 1.50, 'תחנת ביאליק', 'תחנת סבידור מרכז', current_date + 33, 'דמו קשר', '050-0000016', 'demo16@example.com', 'yad2_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'חדר באריאל ליד האוניברסיטה', 'חדר בדירה שקטה במרחק הליכה מהקמפוס.', 'room', 'Ariel', 'Ariel Center', 'רחוב דמו 17', 32.1048000, 35.2057000, 1750, 1.0, 2, 13, false, false, true, true, true, false, true, 2, false, null, 0.60, 120, 12.00, 'תחנת אוניברסיטת אריאל', 'ראש העין צפון', current_date + 6, 'דמו קשר', '050-0000017', 'demo17@example.com', 'university_board_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'דירת שני חדרים באריאל', 'דירה נעימה ומתאימה לזוג סטודנטים.', 'apartment', 'Ariel', 'Ariel West', 'רחוב דמו 18', 32.1065000, 35.1980000, 2850, 2.0, 1, 46, true, false, true, true, false, true, false, 0, false, null, 1.40, 190, 13.00, 'תחנת דרך הציונות', 'ראש העין צפון', current_date + 19, 'דמו קשר', '050-0000018', 'demo18@example.com', 'manual_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'חדר לשותף באריאל מזרח', 'חדר מרוהט עם חניה, מתאים למי שמגיע ברכב.', 'room', 'Ariel', 'Ariel East', 'רחוב דמו 19', 32.1017000, 35.2145000, 1650, 1.0, 3, 12, false, false, true, true, true, false, true, 1, true, null, 1.80, 220, 14.00, 'תחנת פארק אריאל', 'ראש העין צפון', current_date + 24, 'דמו קשר', '050-0000019', 'demo19@example.com', 'facebook_group_demo', 'active'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'דירת שותפים ליד רכבת אוניברסיטה', 'דירה גדולה עם גישה מהירה לאוטובוסים ורכבת.', 'apartment', 'Tel Aviv', 'Ramat Aviv', 'רחוב דמו 20', 32.1035000, 34.8048000, 6900, 4.0, 7, 92, true, true, true, true, true, true, true, 3, false, null, 1.50, 100, 0.60, 'תחנת קלאוזנר', 'תחנת אוניברסיטה', current_date + 35, 'דמו קשר', '050-0000020', 'demo20@example.com', 'yad2_demo', 'active');

insert into public.listing_images (listing_id, image_url, alt_text)
select
  id,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'תמונת דמו לדירה - לא תמונה מהנכס'
from public.listings;

-- User-dependent demo data intentionally omitted:
-- profiles.id references auth.users(id), so favorites, messages, roommate_preferences,
-- roommate_matches, AI conversations, Telegram links, reports, and admin actions should be
-- inserted only after real Supabase Auth users exist.
