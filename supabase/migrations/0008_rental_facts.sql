-- ============================================================================
-- 0008_rental_facts.sql
--
-- Adds the Israeli-rental facts students actually ask about:
--   • Is arnona (municipal tax) included?
--   • Is electricity / water / internet included?
--   • Is the building maintenance fee (ועד בית) included?
--   • Is there a mamad (safe room) inside the apartment?
--   • Is there a public shelter (מקלט) in the building?
--   • How many months of deposit? Agent fee?
--
-- The columns are added with defaults, then backfilled across the existing
-- 164 seed rows with a mix of yes / no values so filters and the AI agent
-- have varied data to work with. Descriptions are also enriched with a
-- Hebrew paragraph mentioning these facts so the AI can quote directly.
--
-- Safe to re-run (add column if not exists; deterministic backfill).
-- ============================================================================

alter table public.listings
  add column if not exists includes_arnona boolean,
  add column if not exists includes_electricity boolean,
  add column if not exists includes_water boolean,
  add column if not exists includes_internet boolean,
  add column if not exists includes_building_fee boolean,
  add column if not exists has_mamad boolean,
  add column if not exists has_shelter boolean,
  add column if not exists deposit_months numeric(3,1),
  add column if not exists agent_fee_months numeric(3,1);

-- Deterministic backfill: uses the listing.id hash (via md5 → int mod)
-- so the values are stable across re-runs and vary per listing.
with fact_seed as (
  select
    id,
    ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as h
  from public.listings
),
facts as (
  select
    id,
    -- Arnona included in ~35%
    (abs(h) % 100) < 35                                as f_arnona,
    -- Electricity almost never included (~10%)
    (abs(h) % 100) < 10                                as f_elec,
    -- Water included ~60%
    (abs(h / 7) % 100) < 60                            as f_water,
    -- Internet included ~40%
    (abs(h / 13) % 100) < 40                           as f_internet,
    -- Building fee (ועד בית) included ~70%
    (abs(h / 19) % 100) < 70                           as f_bldg,
    -- Mamad (safe room INSIDE apartment) ~55%. New buildings have it,
    -- old ones don't. Deterministic-random on the hash.
    (abs(h / 23) % 100) < 55                           as f_mamad,
    -- Public shelter in building ~80%
    (abs(h / 29) % 100) < 80                           as f_shelter,
    -- Deposit: 1-3 months
    (1 + (abs(h / 37) % 3))::numeric(3,1)              as f_deposit,
    -- Agent fee: 0 (private landlord) or 1 month
    case when (abs(h / 41) % 2) = 0 then 0::numeric(3,1) else 1::numeric(3,1) end as f_agent_fee
  from fact_seed
)
update public.listings l
set includes_arnona      = f.f_arnona,
    includes_electricity = f.f_elec,
    includes_water       = f.f_water,
    includes_internet    = f.f_internet,
    includes_building_fee= f.f_bldg,
    has_mamad            = f.f_mamad,
    has_shelter          = f.f_shelter,
    deposit_months       = f.f_deposit,
    agent_fee_months     = f.f_agent_fee
from facts f
where l.id = f.id
  -- only backfill if the fields haven't been set yet, so users don't get
  -- their real values overwritten on re-run.
  and l.includes_arnona is null;

-- Append a Hebrew rental-facts paragraph to the description so the AI can
-- quote directly. We use a marker '--- פרטי שכירות ---' so re-running the
-- migration doesn't stack duplicates.
update public.listings
set description = coalesce(description, '') ||
  E'\n\n--- פרטי שכירות ---\n' ||
  case when includes_arnona then 'ארנונה — כלולה במחיר.' else 'ארנונה — לא כלולה, על השוכר.' end || ' ' ||
  case when includes_electricity then 'חשמל — כלול.' else 'חשמל — לא כלול.' end || ' ' ||
  case when includes_water then 'מים — כלולים.' else 'מים — לא כלולים.' end || ' ' ||
  case when includes_internet then 'אינטרנט — כלול.' else 'אינטרנט — על השוכר להסדיר בעצמו.' end || ' ' ||
  case when includes_building_fee then 'ועד בית — כלול.' else 'ועד בית — לא כלול.' end || E'\n' ||
  case when has_mamad then 'ממ"ד — קיים בדירה עצמה.' else 'ממ"ד — אין ממ"ד פרטי בדירה.' end || ' ' ||
  case when has_shelter then 'מקלט — קיים מקלט משותף בבניין.' else 'מקלט — אין מקלט בבניין (המקלט השכונתי הקרוב במרחק הליכה).' end || E'\n' ||
  'פיקדון — ' || deposit_months::text || ' חודשי שכירות. ' ||
  case when agent_fee_months > 0 then 'דמי תיווך — ' || agent_fee_months::text || ' חודשי שכירות + מע"מ.' else 'דמי תיווך — אין (מודעה מבעל הדירה).' end
where description is not null
  and description not like '%--- פרטי שכירות ---%';
