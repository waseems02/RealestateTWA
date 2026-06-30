# Data Sources and Ethics

## Current Data

RoomieFit / CampusNest Israel currently uses fake demo data only. The expanded Supabase seed files create realistic academic demo listings for apartments and rooms near Israeli universities and colleges.

The listings are not real offers. They are not scraped from Yad2, Facebook, WhatsApp groups, or any private/protected source.

## Structure Inspiration

The demo structure is inspired by common student housing needs:

- city, neighborhood, street or area text
- price, rooms, floor, size, and amenities
- roommate suitability and current roommate count
- optional general lifestyle preference
- campus distance and public transportation access
- safe contact placeholders

Lifestyle preference is optional and general. It must not be used as a mandatory or discriminatory filter.

## Future Legal Sources

Future work may consider legal and approved integrations only:

- university housing pages and student services pages
- public university student union housing boards, where allowed
- official municipality open data portals for neighborhoods and transportation
- OpenStreetMap / Leaflet for maps and approximate coordinates
- Israel GTFS public transportation data, if used under permitted terms
- manual listing submissions from users
- approved APIs with clear permission and terms

## No Protected Scraping

The project does not scrape protected websites, private groups, WhatsApp groups, or platforms where automated collection is not clearly allowed. This protects user privacy, respects platform terms, and avoids importing unverifiable or sensitive personal information.

## Privacy Policy for Demo Data

- Use fake names, phone numbers, and emails in seed data.
- Do not include real tenant, landlord, or student personal data.
- Do not infer or require religion, ethnicity, gender, or family status.
- Keep source labels such as `yad2_demo` and `facebook_group_demo` as demo provenance labels only.
- Replace demo data with user-submitted or approved-source data only after consent and legal review.
