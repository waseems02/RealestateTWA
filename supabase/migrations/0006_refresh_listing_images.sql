-- ============================================================================
-- 0006_refresh_listing_images.sql
--
-- The seeded listing_images were all variants of the same handful of
-- generic Unsplash interior photos — they looked repetitive and broken.
-- Switch to picsum.photos with the listing id as a deterministic seed so
-- every listing gets a unique, always-loading image.
--
-- Idempotent: safe to re-run, only touches the listing_images table.
-- ============================================================================

update public.listing_images li
set image_url = 'https://picsum.photos/seed/' || li.listing_id || '/1200/800'
where image_url like 'https://images.unsplash.com/%'
   or image_url like 'https://picsum.photos/%';
