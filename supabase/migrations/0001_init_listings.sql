-- RoomieFit initial schema: universities, listings, listing_universities
-- Region: ap-southeast-1 (Supabase project nvpfxtsxgfvjerzfaaiw)

-- =====================================================================
-- Enums
-- =====================================================================

create type public.roommate_status_enum   as enum ('student', 'professional', 'mixed');
create type public.religious_tag_enum     as enum ('secular', 'traditional', 'religious', 'mixed');
create type public.furnished_enum         as enum ('none', 'partial', 'full');
create type public.listing_source_enum    as enum ('yad2', 'facebook', 'manual', 'other');
create type public.gender_preference_enum as enum ('any', 'male', 'female');

-- =====================================================================
-- Universities
-- =====================================================================

create table public.universities (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null unique,
  name_he     text not null,
  city        text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  created_at  timestamptz not null default now()
);

-- Seed major Israeli universities + colleges
insert into public.universities (name_en, name_he, city, latitude, longitude) values
  ('Tel Aviv University',           'אוניברסיטת תל אביב',           'Tel Aviv',       32.1133, 34.8044),
  ('Hebrew University of Jerusalem','האוניברסיטה העברית בירושלים', 'Jerusalem',      31.7766, 35.1972),
  ('Technion',                      'הטכניון',                      'Haifa',          32.7780, 35.0234),
  ('Bar-Ilan University',           'אוניברסיטת בר-אילן',           'Ramat Gan',      32.0700, 34.8425),
  ('Ben-Gurion University',         'אוניברסיטת בן-גוריון',         'Beer Sheva',     31.2620, 34.8016),
  ('University of Haifa',           'אוניברסיטת חיפה',              'Haifa',          32.7619, 35.0203),
  ('Reichman University',           'אוניברסיטת רייכמן',            'Herzliya',       32.1668, 34.8123),
  ('Ariel University',              'אוניברסיטת אריאל',             'Ariel',          32.1043, 35.2030),
  ('Sapir Academic College',        'המכללה האקדמית ספיר',          'Sderot',         31.5232, 34.6033),
  ('Open University of Israel',     'האוניברסיטה הפתוחה',           'Raanana',        32.1810, 34.8950),
  ('Bezalel Academy',               'בצלאל - אקדמיה לאמנות',        'Jerusalem',      31.7857, 35.2007),
  ('Holon Institute of Technology', 'מכון טכנולוגי חולון',          'Holon',          32.0170, 34.7780);

-- =====================================================================
-- Listings
-- =====================================================================

create table public.listings (
  id                          uuid primary key default gen_random_uuid(),

  -- core
  title                       text not null,
  description                 text,
  price_nis                   integer not null check (price_nis >= 0),
  size_sqm                    numeric(6,2),
  rooms                       numeric(3,1) check (rooms > 0),
  floor                       integer,

  -- amenities
  has_balcony                 boolean not null default false,
  pets_allowed                boolean not null default false,
  smoking_allowed             boolean not null default false,
  furnished                   public.furnished_enum not null default 'none',
  parking_available           boolean not null default false,
  air_conditioning            boolean not null default false,
  accessible                  boolean not null default false,

  -- lease
  lease_months                integer check (lease_months > 0),
  available_from              date,

  -- location distances (in metres)
  bus_stop_distance_m         integer check (bus_stop_distance_m >= 0),
  train_station_distance_m    integer check (train_station_distance_m >= 0),
  nearest_supermarket_m       integer check (nearest_supermarket_m >= 0),

  -- roommates
  num_roommates               integer not null default 0 check (num_roommates >= 0),
  roommates_status            public.roommate_status_enum,
  roommates_religious_tag     public.religious_tag_enum,
  gender_preference           public.gender_preference_enum not null default 'any',

  -- subjective ratings (1-5)
  noise_level                 smallint check (noise_level between 1 and 5),
  safety_rating               smallint check (safety_rating between 1 and 5),

  -- location
  city                        text,
  neighborhood                text,
  latitude                    double precision not null,
  longitude                   double precision not null,

  -- provenance
  source                      public.listing_source_enum not null default 'manual',
  source_url                  text,
  external_id                 text,

  -- contact
  contact_phone               text,
  contact_name                text,

  -- moderation
  is_active                   boolean not null default true,
  needs_review                boolean not null default false,

  -- timestamps
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index listings_price_idx     on public.listings (price_nis);
create index listings_city_idx      on public.listings (city);
create index listings_geo_idx       on public.listings (latitude, longitude);
create index listings_active_idx    on public.listings (is_active) where is_active = true;

-- Dedupe on source + external_id (e.g. yad2 listing id), nullable so manual entries are fine
create unique index listings_source_external_uniq
  on public.listings (source, external_id)
  where external_id is not null;

-- =====================================================================
-- updated_at trigger
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- Listing <-> University junction
-- =====================================================================

create table public.listing_universities (
  listing_id    uuid not null references public.listings(id)     on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  distance_m    integer not null check (distance_m >= 0),
  primary key (listing_id, university_id)
);

create index listing_universities_university_idx
  on public.listing_universities (university_id);

-- =====================================================================
-- Row-Level Security
-- =====================================================================

alter table public.universities         enable row level security;
alter table public.listings             enable row level security;
alter table public.listing_universities enable row level security;

-- Universities: world-readable (small reference table)
create policy "universities_public_read"
  on public.universities
  for select
  to anon, authenticated
  using (true);

-- Listings: anyone can read active listings
create policy "listings_public_read_active"
  on public.listings
  for select
  to anon, authenticated
  using (is_active = true);

-- Junction follows the listing
create policy "listing_universities_public_read"
  on public.listing_universities
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_universities.listing_id and l.is_active = true
    )
  );

-- Writes only via service_role (used by backend); no public write policies.
