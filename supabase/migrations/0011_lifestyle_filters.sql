-- ============================================================================
-- 0011_lifestyle_filters.sql
--
-- Adds four new roommate-lifestyle filters students actually ask about:
--   • Religious Importance (Not Important / Somewhat / Very Important)
--   • Guests frequency (Rarely / Sometimes / Often)
--   • Cooking frequency (Rarely / Sometimes / Daily)
--   • Alcohol frequency (Never / Socially / Often)
--
-- Columns are added with a CHECK constraint, then backfilled across the
-- existing 164 rows with a deterministic per-listing hash so filters have
-- realistic data to work with. Also appends the values to each description
-- so the AI agent can quote them directly.
--
-- Idempotent: safe to re-run (add column IF NOT EXISTS + description marker).
-- ============================================================================

alter table public.listings
  add column if not exists religious_importance text
    check (religious_importance in ('not_important', 'somewhat', 'very')),
  add column if not exists guests_frequency text
    check (guests_frequency in ('rarely', 'sometimes', 'often')),
  add column if not exists cooking_frequency text
    check (cooking_frequency in ('rarely', 'sometimes', 'daily')),
  add column if not exists alcohol_frequency text
    check (alcohol_frequency in ('never', 'socially', 'often'));

-- Deterministic backfill — same listing always gets the same values,
-- so re-running the migration doesn't shuffle them.
update public.listings
set religious_importance = (array['not_important','somewhat','very'])[1 + (abs(hashtext(id::text || 'rel')) % 3)],
    guests_frequency     = (array['rarely','sometimes','often'])[1 + (abs(hashtext(id::text || 'guests')) % 3)],
    cooking_frequency    = (array['rarely','sometimes','daily'])[1 + (abs(hashtext(id::text || 'cook')) % 3)],
    alcohol_frequency    = (array['never','socially','often'])[1 + (abs(hashtext(id::text || 'alc')) % 3)]
where religious_importance is null;

-- Append lifestyle facts to the description so the AI can cite them
-- verbatim. Marker prevents duplicates on re-run.
update public.listings
set description = coalesce(description, '') ||
  E'\n\n--- אורח חיים בדירה ---\n' ||
  'חשיבות דת: ' || (case religious_importance
    when 'not_important' then 'לא חשוב'
    when 'somewhat'      then 'קצת חשוב'
    when 'very'          then 'חשוב מאוד'
  end) || E'\n' ||
  'אורחים: ' || (case guests_frequency
    when 'rarely'    then 'לעיתים רחוקות'
    when 'sometimes' then 'לפעמים'
    when 'often'     then 'לעיתים קרובות'
  end) || E'\n' ||
  'בישול: ' || (case cooking_frequency
    when 'rarely'    then 'לעיתים רחוקות'
    when 'sometimes' then 'לפעמים'
    when 'daily'     then 'מדי יום'
  end) || E'\n' ||
  'אלכוהול: ' || (case alcohol_frequency
    when 'never'    then 'לא שותים'
    when 'socially' then 'רק חברתי'
    when 'often'    then 'לעיתים קרובות'
  end)
where description is not null
  and religious_importance is not null
  and description not like '%--- אורח חיים בדירה ---%';
