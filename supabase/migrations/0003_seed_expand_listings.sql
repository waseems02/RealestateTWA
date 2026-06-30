-- RoomieFit: expand seed with 60+ listings across all 12 universities.
-- Mixed sources (yad2 / facebook / manual / other) to make the hybrid-source story visible in the UI.
-- Idempotent: dedupes on (source, external_id) via the partial unique index from 0001.
-- Safe to re-run.

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
      source, source_url, external_id
    ) values
      -- ============================================================
      -- TEL AVIV / RAMAT AVIV (TAU)
      -- ============================================================
      ('דירת 2 חדרים משופצת ברמת אביב ג',
       'דירה משופצת לגמרי קומה 2, ליד הקמפוס. מתאימה לסטודנט/ית או זוג.',
       5400, 58, 2, 2, true, false, false, 'partial',
       false, true, false, 12, current_date,
       110, 1400, 280, 0, null, null, 'any', 2, 5,
       'Tel Aviv', 'Ramat Aviv Gimel', 32.1158, 34.8071,
       'yad2', 'https://www.yad2.co.il/realestate/item/r-aviv-101', 'seed_v3_001'),

      ('חדר בדירת 4 שותפים ליד אוניברסיטת תל אביב',
       'חדר פרטי בדירה גדולה. שותפים סטודנטים שקטים, אווירה ביתית.',
       2800, 18, 4, 3, false, true, false, 'full',
       false, true, false, 12, current_date,
       80, 1100, 200, 3, 'student', 'secular', 'any', 2, 4,
       'Tel Aviv', 'Ramat Aviv', 32.1126, 34.8055,
       'facebook', 'https://www.facebook.com/groups/tau.dirot/permalink/2001', 'seed_v3_002'),

      ('דירת 3 חדרים בצפון הישן עם מרפסת',
       'דירה מרווחת ומוארת, ליד דיזנגוף סנטר. תחבורה מצוינת לאוניברסיטה.',
       7200, 78, 3, 4, true, false, false, 'full',
       true, true, true, 12, current_date + interval '21 days',
       50, 700, 100, 2, 'mixed', 'secular', 'any', 3, 5,
       'Tel Aviv', 'Old North', 32.0890, 34.7770,
       'yad2', 'https://www.yad2.co.il/realestate/item/oldnorth-102', 'seed_v3_003'),

      ('חדר בדירת בנות בנווה צדק',
       'חדר בדירת 3 בנות סטודנטיות. אווירה שקטה ומסודרת.',
       3200, 16, 3, 2, false, false, false, 'full',
       false, true, false, 12, current_date + interval '14 days',
       90, 600, 250, 2, 'student', 'secular', 'female', 2, 4,
       'Tel Aviv', 'Neve Tzedek', 32.0610, 34.7670,
       'facebook', 'https://www.facebook.com/groups/students.tlv/permalink/2002', 'seed_v3_004'),

      ('דירת 4 חדרים בפלורנטין לשותפים',
       'דירה גדולה לארבעה שותפים, גג משותף, אווירה צעירה ותוססת.',
       8000, 92, 4, 3, true, true, true, 'full',
       false, true, false, 12, current_date,
       70, 850, 180, 0, null, null, 'any', 4, 3,
       'Tel Aviv', 'Florentin', 32.0560, 34.7720,
       'yad2', 'https://www.yad2.co.il/realestate/item/florentin-103', 'seed_v3_005'),

      ('סטודיו קטן ביפו ליד הקווים',
       'סטודיו קומפקטי בעיר העתיקה של יפו, גישה נוחה לאוטובוסים.',
       3500, 28, 1, 1, false, false, false, 'partial',
       false, true, false, 12, current_date,
       40, 500, 150, 0, null, null, 'any', 4, 3,
       'Tel Aviv', 'Old Jaffa', 32.0530, 34.7580,
       'other', 'https://www.homeless.co.il/listing/jaffa-104', 'seed_v3_006'),

      ('דירת 2 חדרים בכרם התימנים',
       'דירה אותנטית עם תקרות גבוהות, ליד הכרמל ולבונבון.',
       6100, 52, 2, 2, true, false, false, 'partial',
       false, true, false, 12, current_date + interval '30 days',
       60, 450, 200, 1, 'mixed', 'secular', 'any', 3, 4,
       'Tel Aviv', 'Kerem HaTeimanim', 32.0710, 34.7670,
       'yad2', 'https://www.yad2.co.il/realestate/item/kerem-105', 'seed_v3_007'),

      ('חדר בגבעתיים ליד הרכבת הקלה',
       'חדר בדירה מרוהטת, גישה נוחה לתל אביב ולמרכז.',
       2700, 15, 3, 2, false, false, false, 'full',
       true, true, false, 12, current_date,
       100, 350, 220, 2, 'student', 'secular', 'any', 2, 5,
       'Givatayim', 'Center', 32.0700, 34.8050,
       'facebook', 'https://www.facebook.com/groups/givatayim/permalink/2003', 'seed_v3_008'),

      ('דירת 1.5 חדרים בלב העיר',
       'דירה מרוהטת לגמרי קומה 5 עם מעלית, ליד שדרות רוטשילד.',
       5800, 42, 1.5, 5, true, false, false, 'full',
       false, true, true, 12, current_date,
       30, 400, 120, 0, null, null, 'any', 3, 5,
       'Tel Aviv', 'Rothschild', 32.0640, 34.7740,
       'yad2', 'https://www.yad2.co.il/realestate/item/rothschild-106', 'seed_v3_009'),

      ('חדר בדירת 5 שותפים סמוך לאוניברסיטה',
       'חדר זול בדירה גדולה, מתאים לסטודנטים שמחפשים סביבה חברתית.',
       2200, 12, 5, 1, false, true, true, 'full',
       false, true, false, 12, current_date,
       120, 1300, 350, 4, 'student', 'mixed', 'any', 4, 3,
       'Tel Aviv', 'Ramat Aviv', 32.1145, 34.8030,
       'manual', null, 'seed_v3_010'),

      -- ============================================================
      -- JERUSALEM
      -- ============================================================
      ('דירת 3 חדרים בגבעה הצרפתית',
       'דירה ליד קמפוס הר הצופים, נוף מרהיב, חניה.',
       5200, 70, 3, 3, true, false, false, 'full',
       true, true, false, 12, current_date + interval '14 days',
       150, 3000, 400, 2, 'student', 'traditional', 'any', 2, 5,
       'Jerusalem', 'French Hill', 31.7960, 35.2400,
       'yad2', 'https://www.yad2.co.il/realestate/item/jslm-french-201', 'seed_v3_011'),

      ('חדר בדירת חרדים מודרניים בנחלאות',
       'חדר בדירת שותפים דתיים, אווירה משפחתית, מטבח כשר.',
       2600, 14, 4, 2, false, false, false, 'full',
       false, true, false, 12, current_date,
       70, 2800, 180, 3, 'student', 'religious', 'male', 1, 5,
       'Jerusalem', 'Nachlaot', 31.7820, 35.2150,
       'facebook', 'https://www.facebook.com/groups/dirot.jslm/permalink/3001', 'seed_v3_012'),

      ('דירת 2 חדרים ברחביה',
       'דירה שקטה ברחביה, ליד גבעת רם, כניסה גמישה.',
       4900, 58, 2, 1, true, false, false, 'partial',
       true, true, false, 12, current_date + interval '7 days',
       100, 4500, 300, 1, 'student', 'traditional', 'female', 2, 5,
       'Jerusalem', 'Rehavia', 31.7785, 35.2125,
       'yad2', 'https://www.yad2.co.il/realestate/item/jslm-rehavia-202', 'seed_v3_013'),

      ('סטודיו בקטמון',
       'סטודיו חמוד עם מרפסת קטנה, אווירה רגועה ושכונתית.',
       3700, 36, 1, 1, true, false, false, 'full',
       false, true, false, 12, current_date,
       80, 3500, 280, 0, null, null, 'any', 1, 5,
       'Jerusalem', 'Katamon', 31.7670, 35.2100,
       'manual', null, 'seed_v3_014'),

      ('חדר בדירת 3 חברות באבו תור',
       'אווירת בנות שלווה, נוף לעיר העתיקה, מרפסת משותפת.',
       2800, 16, 3, 2, true, false, false, 'partial',
       false, true, false, 12, current_date + interval '21 days',
       80, 3500, 200, 2, 'student', 'mixed', 'female', 1, 4,
       'Jerusalem', 'Abu Tor', 31.7620, 35.2300,
       'facebook', 'https://www.facebook.com/groups/jslm.bnot/permalink/3002', 'seed_v3_015'),

      ('דירת 4 חדרים בבית הכרם',
       'דירה גדולה, מתאימה לשלושה שותפים, ליד הטכנולוגי.',
       6800, 88, 4, 3, true, true, false, 'full',
       true, true, false, 12, current_date,
       60, 4000, 250, 2, 'student', 'mixed', 'any', 2, 5,
       'Jerusalem', 'Beit HaKerem', 31.7700, 35.1880,
       'yad2', 'https://www.yad2.co.il/realestate/item/jslm-bhkerem-203', 'seed_v3_016'),

      ('חדר בדירה לסטודנטים בארנונה',
       'חדר במחיר נוח, סביבה חרדית, מעדיפים בני תורה.',
       2100, 13, 4, 0, false, false, false, 'partial',
       false, false, false, 12, current_date,
       90, 5000, 200, 3, 'student', 'religious', 'male', 1, 5,
       'Jerusalem', 'Arnona', 31.7530, 35.2200,
       'other', 'https://www.dirahome.co.il/listings/jslm-204', 'seed_v3_017'),

      ('דירת 2.5 חדרים בטלביה',
       'דירה משופצת, חצר משותפת, ליד מוזיאון ישראל.',
       6300, 64, 2.5, 1, true, false, false, 'full',
       true, true, true, 24, current_date + interval '14 days',
       80, 3800, 320, 1, 'mixed', 'secular', 'any', 2, 5,
       'Jerusalem', 'Talbiya', 31.7670, 35.2150,
       'yad2', 'https://www.yad2.co.il/realestate/item/jslm-talbiya-205', 'seed_v3_018'),

      -- ============================================================
      -- HAIFA (TECHNION + U. HAIFA)
      -- ============================================================
      ('דירת 4 חדרים בנווה שאנן ליד הטכניון',
       'דירה ענקית עם 3 שותפים, חניה כפולה, גג עם נוף.',
       4400, 92, 4, 0, true, true, false, 'full',
       true, true, false, 12, current_date,
       50, 3500, 300, 3, 'student', 'mixed', 'any', 2, 5,
       'Haifa', 'Neve Shaanan', 32.7785, 35.0205,
       'yad2', 'https://www.yad2.co.il/realestate/item/haifa-neveshaanan-301', 'seed_v3_019'),

      ('חדר בדירת בנים בנווה שאנן',
       'חדר נוח בדירה לארבעה סטודנטים, ליד כל הקווים לטכניון.',
       1900, 14, 4, 2, false, false, true, 'full',
       false, true, false, 12, current_date,
       60, 4000, 200, 3, 'student', 'secular', 'male', 4, 4,
       'Haifa', 'Neve Shaanan', 32.7770, 35.0218,
       'facebook', 'https://www.facebook.com/groups/technion.housing/permalink/4001', 'seed_v3_020'),

      ('סטודיו עם נוף לכינרת בכרמל',
       'סטודיו רומנטי ליחיד או זוג, נוף עוצר נשימה.',
       3800, 35, 1, 4, true, false, false, 'full',
       false, true, false, 12, current_date + interval '30 days',
       150, 6000, 450, 0, null, null, 'any', 1, 5,
       'Haifa', 'Carmel', 32.7610, 35.0190,
       'yad2', 'https://www.yad2.co.il/realestate/item/haifa-carmel-302', 'seed_v3_021'),

      ('דירת 3 חדרים בהדר',
       'דירת סטודנטים קלאסית, גישה לאוניברסיטת חיפה במטרונית.',
       3200, 65, 3, 2, true, true, true, 'partial',
       false, false, false, 12, current_date,
       40, 1800, 250, 2, 'student', 'secular', 'any', 3, 3,
       'Haifa', 'Hadar', 32.8100, 34.9920,
       'facebook', 'https://www.facebook.com/groups/haifa.students/permalink/4002', 'seed_v3_022'),

      ('חדר בדירת 3 שותפות באחוזה',
       'חדר בדירה לבנות בלבד, סביבה שקטה, ליד אוניברסיטת חיפה.',
       2400, 15, 3, 1, false, false, false, 'full',
       false, true, false, 12, current_date + interval '14 days',
       70, 5500, 200, 2, 'student', 'mixed', 'female', 1, 5,
       'Haifa', 'Ahuza', 32.7760, 34.9990,
       'yad2', 'https://www.yad2.co.il/realestate/item/haifa-ahuza-303', 'seed_v3_023'),

      ('דירת 2 חדרים בכרמליה',
       'דירה חמודה, מרפסת עם נוף לים, גישה לטכניון.',
       4100, 55, 2, 3, true, false, false, 'full',
       true, true, false, 12, current_date,
       80, 4500, 300, 0, null, null, 'any', 2, 5,
       'Haifa', 'Carmelia', 32.7850, 35.0140,
       'manual', null, 'seed_v3_024'),

      ('חדר במחיר סופר נוח בנווה דוד',
       'הזולה בעיר, בשכונה מתפתחת, מתאים לסטודנט עצמאי.',
       1600, 12, 3, 1, false, true, true, 'partial',
       false, false, false, 6, current_date,
       100, 2500, 350, 2, 'student', 'mixed', 'male', 4, 2,
       'Haifa', 'Neve David', 32.8090, 35.0050,
       'other', 'https://www.haifa-housing.co.il/listings/305', 'seed_v3_025'),

      ('דירת 5 חדרים בכבביר לקבוצת חברים',
       'מתאים ל-4 שותפים, חצר משותפת, מאוד שקט.',
       5200, 110, 5, 0, true, true, false, 'full',
       true, true, true, 24, current_date + interval '60 days',
       90, 5500, 400, 3, 'student', 'mixed', 'any', 1, 5,
       'Haifa', 'Kababir', 32.7820, 35.0070,
       'yad2', 'https://www.yad2.co.il/realestate/item/haifa-kababir-306', 'seed_v3_026'),

      -- ============================================================
      -- BEER SHEVA (BGU)
      -- ============================================================
      ('חדר בדירת 4 שותפים ברובע ג',
       'מרחק הליכה לקמפוס בן-גוריון, אווירה סטודנטיאלית.',
       1650, 14, 4, 2, false, false, true, 'full',
       true, true, false, 12, current_date,
       40, 600, 100, 3, 'student', 'secular', 'any', 4, 3,
       'Beer Sheva', 'Gimel', 31.2640, 34.7990,
       'facebook', 'https://www.facebook.com/groups/bgu.dirot/permalink/5001', 'seed_v3_027'),

      ('דירת 2 חדרים ליד אוניברסיטת בן-גוריון',
       'דירה משופצת, מטבח חדש, מצלמת אבטחה בבניין.',
       3000, 50, 2, 2, true, false, false, 'full',
       false, true, false, 12, current_date,
       60, 800, 150, 0, null, null, 'any', 2, 4,
       'Beer Sheva', 'Aleph', 31.2610, 34.8025,
       'yad2', 'https://www.yad2.co.il/realestate/item/bsv-aleph-401', 'seed_v3_028'),

      ('חדר בדירת בנות חיילות וסטודנטיות',
       'חדר זול בדירה לחיילות וסטודנטיות, מעדיפים לא מעשנות.',
       1500, 13, 5, 1, false, false, false, 'partial',
       false, true, false, 12, current_date,
       50, 700, 120, 4, 'mixed', 'secular', 'female', 3, 3,
       'Beer Sheva', 'Daled', 31.2660, 34.7970,
       'facebook', 'https://www.facebook.com/groups/bsv.bnot/permalink/5002', 'seed_v3_029'),

      ('דירת 3 חדרים ברובע ב',
       'דירה שלמה ל-2 שותפים. חניה, מזגן בכל חדר.',
       3600, 68, 3, 1, true, true, false, 'full',
       true, true, false, 12, current_date,
       80, 1000, 200, 2, 'student', 'mixed', 'any', 3, 3,
       'Beer Sheva', 'Bet', 31.2598, 34.8005,
       'yad2', 'https://www.yad2.co.il/realestate/item/bsv-bet-402', 'seed_v3_030'),

      ('סטודיו חדש בעיר העתיקה',
       'סטודיו מודרני ברובע ההיסטורי, מקלחת איטלקית.',
       2400, 28, 1, 2, false, false, false, 'full',
       false, true, true, 12, current_date + interval '14 days',
       70, 500, 250, 0, null, null, 'any', 2, 4,
       'Beer Sheva', 'Old City', 31.2425, 34.7920,
       'manual', null, 'seed_v3_031'),

      ('חדר בדירה דתית בנווה זאב',
       'חדר בדירת 3 בני תורה, מטבח כשר למהדרין, ליד ישיבות.',
       1700, 14, 3, 0, false, false, false, 'full',
       false, true, false, 12, current_date,
       60, 2500, 180, 2, 'student', 'religious', 'male', 1, 5,
       'Beer Sheva', 'Neve Zeev', 31.2390, 34.7700,
       'other', 'https://www.dirahome.co.il/listings/bsv-403', 'seed_v3_032'),

      -- ============================================================
      -- RAMAT GAN / BAR-ILAN
      -- ============================================================
      ('דירת 4 חדרים בגבעת שמואל',
       'דירה משפחתית מותאמת לשותפים דתיים, מרחק הליכה לבר-אילן.',
       5000, 90, 4, 3, true, false, false, 'full',
       true, true, false, 12, current_date + interval '21 days',
       100, 1800, 300, 3, 'student', 'religious', 'any', 1, 5,
       'Ramat Gan', 'Givat Shmuel', 32.0720, 34.8450,
       'yad2', 'https://www.yad2.co.il/realestate/item/biu-501', 'seed_v3_033'),

      ('חדר בדירה דתית-לאומית בבני ברק',
       'חדר באווירה דתית, סביבה שקטה ושומרת שבת.',
       2200, 14, 4, 2, false, false, false, 'full',
       false, true, false, 12, current_date,
       80, 2200, 150, 3, 'student', 'religious', 'male', 1, 5,
       'Bnei Brak', 'Pardes Katz', 32.0810, 34.8430,
       'facebook', 'https://www.facebook.com/groups/dirot.bb/permalink/6001', 'seed_v3_034'),

      ('דירת 2 חדרים ברמת גן מרכז',
       'דירה משופצת ליד גן הוורדים, גישה נוחה לבר-אילן ולתל אביב.',
       5800, 60, 2, 4, true, false, false, 'partial',
       true, true, true, 12, current_date,
       50, 800, 200, 0, null, null, 'any', 3, 4,
       'Ramat Gan', 'City Center', 32.0830, 34.8170,
       'yad2', 'https://www.yad2.co.il/realestate/item/rmg-502', 'seed_v3_035'),

      ('חדר בדירת בנים חרדים בגבעת שמואל',
       'חדר בדירה לבחורי ישיבה, מטבח כשר, מתאים ללומדים.',
       1900, 13, 4, 1, false, false, false, 'full',
       false, true, false, 12, current_date,
       90, 2000, 180, 3, 'student', 'religious', 'male', 1, 5,
       'Ramat Gan', 'Givat Shmuel', 32.0700, 34.8470,
       'facebook', 'https://www.facebook.com/groups/biu.dirot/permalink/6002', 'seed_v3_036'),

      ('דירת 3.5 חדרים בקריית אונו',
       'דירה ענקית עם מרפסת שמש, גישה לבר-אילן ולאיילון.',
       6500, 82, 3.5, 2, true, true, false, 'full',
       true, true, false, 12, current_date,
       100, 1200, 350, 2, 'mixed', 'mixed', 'any', 2, 5,
       'Kiryat Ono', 'City Center', 32.0560, 34.8590,
       'manual', null, 'seed_v3_037'),

      -- ============================================================
      -- HERZLIYA / REICHMAN
      -- ============================================================
      ('דירת 3 חדרים בהרצליה צעירה',
       'דירה מודרנית ליד הרכבת והרייכמן, חניה, מעלית.',
       6800, 75, 3, 5, true, false, false, 'full',
       true, true, true, 12, current_date,
       40, 350, 150, 2, 'student', 'secular', 'any', 2, 5,
       'Herzliya', 'Young Herzliya', 32.1670, 34.8400,
       'yad2', 'https://www.yad2.co.il/realestate/item/hzl-701', 'seed_v3_038'),

      ('חדר בדירת שותפים בהרצליה פיתוח',
       'חדר בדירה יוקרתית, ליד הים, חברה מאוד טובה.',
       3800, 17, 3, 1, true, false, false, 'full',
       true, true, false, 12, current_date + interval '14 days',
       60, 800, 250, 2, 'professional', 'secular', 'any', 2, 5,
       'Herzliya', 'Herzliya Pituach', 32.1730, 34.8170,
       'facebook', 'https://www.facebook.com/groups/herzliya.students/permalink/7001', 'seed_v3_039'),

      ('סטודיו ברעננה ליד האוניברסיטה הפתוחה',
       'סטודיו מאובזר במלואו, ליד הסטודיו לאמנות.',
       3400, 32, 1, 3, false, false, false, 'full',
       false, true, false, 12, current_date,
       50, 700, 180, 0, null, null, 'any', 2, 5,
       'Raanana', 'City Center', 32.1830, 34.8930,
       'yad2', 'https://www.yad2.co.il/realestate/item/raa-702', 'seed_v3_040'),

      ('דירת 4 חדרים ברעננה למשפחה צעירה',
       'דירה ענקית, גינה משותפת, אווירה משפחתית.',
       7200, 105, 4, 1, true, true, false, 'full',
       true, true, true, 24, current_date + interval '30 days',
       80, 900, 300, 2, 'professional', 'mixed', 'any', 1, 5,
       'Raanana', 'Lev HaPark', 32.1850, 34.8870,
       'manual', null, 'seed_v3_041'),

      -- ============================================================
      -- HOLON / HIT
      -- ============================================================
      ('דירת 2 חדרים בחולון ליד HIT',
       'דירה משופצת, חניה, גישה מהירה לאיילון.',
       4200, 55, 2, 3, true, false, false, 'full',
       true, true, true, 12, current_date,
       50, 1500, 200, 0, null, null, 'any', 2, 4,
       'Holon', 'Holon Center', 32.0170, 34.7790,
       'yad2', 'https://www.yad2.co.il/realestate/item/hlnhit-801', 'seed_v3_042'),

      ('חדר בדירת 3 שותפים סטודנטים בחולון',
       'חדר זול בדירה לסטודנטים, אווירה רגועה ושקטה.',
       2400, 16, 3, 1, false, false, false, 'partial',
       false, true, false, 12, current_date,
       70, 1700, 220, 2, 'student', 'secular', 'any', 2, 4,
       'Holon', 'Kiryat Sharet', 32.0080, 34.7700,
       'facebook', 'https://www.facebook.com/groups/hit.students/permalink/8001', 'seed_v3_043'),

      ('סטודיו חדש בקריית שרת',
       'סטודיו במגדל חדש, מעלית, חניה, מתאים לסטודנט/ית.',
       3300, 35, 1, 8, true, false, false, 'full',
       true, true, true, 12, current_date,
       40, 1800, 180, 0, null, null, 'any', 2, 5,
       'Holon', 'Kiryat Sharet', 32.0050, 34.7720,
       'yad2', 'https://www.yad2.co.il/realestate/item/hlnhit-802', 'seed_v3_044'),

      -- ============================================================
      -- ARIEL
      -- ============================================================
      ('דירת 4 חדרים באריאל ליד הקמפוס',
       'דירה גדולה, מרפסת ענקית, נוף לכל השומרון.',
       3800, 90, 4, 2, true, true, false, 'full',
       true, true, false, 12, current_date,
       80, 8000, 400, 3, 'student', 'religious', 'any', 1, 5,
       'Ariel', 'Ariel Center', 32.1050, 35.2050,
       'yad2', 'https://www.yad2.co.il/realestate/item/ari-901', 'seed_v3_045'),

      ('חדר בדירת 3 שותפים דתיים באריאל',
       'חדר זול בדירת שותפים דתיים, ליד הישיבה.',
       1800, 14, 3, 1, false, false, false, 'full',
       true, true, false, 12, current_date,
       60, 8500, 300, 2, 'student', 'religious', 'male', 1, 5,
       'Ariel', 'Ariel East', 32.1080, 35.2080,
       'facebook', 'https://www.facebook.com/groups/ariel.students/permalink/9001', 'seed_v3_046'),

      ('סטודיו לסטודנטים באריאל',
       'סטודיו חדש, גישה למוצב, מרפסת קטנה.',
       2600, 30, 1, 3, true, false, false, 'partial',
       true, true, false, 12, current_date + interval '21 days',
       100, 9000, 350, 0, null, null, 'any', 2, 5,
       'Ariel', 'Ariel North', 32.1030, 35.2020,
       'manual', null, 'seed_v3_047'),

      -- ============================================================
      -- SDEROT / SAPIR COLLEGE
      -- ============================================================
      ('דירת 3 חדרים בשדרות ליד ספיר',
       'דירה זולה ויפה, חצר משותפת, ממ"ד.',
       2800, 70, 3, 1, true, true, false, 'full',
       true, true, false, 12, current_date,
       100, 8500, 250, 2, 'student', 'mixed', 'any', 2, 4,
       'Sderot', 'Center', 31.5230, 34.6020,
       'yad2', 'https://www.yad2.co.il/realestate/item/sdr-1001', 'seed_v3_048'),

      ('חדר בדירת בנים בשדרות',
       'חדר זול בדירה לבנים סטודנטים, מתאים לאלה שלומדים בספיר.',
       1400, 13, 4, 0, false, false, true, 'partial',
       false, true, false, 12, current_date,
       80, 9000, 200, 3, 'student', 'mixed', 'male', 3, 3,
       'Sderot', 'Hadarim', 31.5210, 34.6050,
       'facebook', 'https://www.facebook.com/groups/sapir.dirot/permalink/10001', 'seed_v3_049'),

      ('סטודיו בנתיבות עם נוף',
       'סטודיו עם מרפסת, גישה לאוטובוס לסדרות וספיר.',
       1900, 28, 1, 2, true, false, false, 'partial',
       true, true, false, 12, current_date,
       50, 12000, 300, 0, null, null, 'any', 1, 5,
       'Netivot', 'Center', 31.4220, 34.5870,
       'other', 'https://www.south-rent.co.il/listings/ntv-1002', 'seed_v3_050'),

      -- ============================================================
      -- JERUSALEM ADDITIONAL (Bezalel students)
      -- ============================================================
      ('סטודיו אומנותי בעין כרם',
       'סטודיו במושבה הציורית, מתאים לסטודנטים של בצלאל.',
       3900, 32, 1, 1, true, true, false, 'partial',
       false, true, false, 12, current_date,
       150, 6000, 500, 0, null, null, 'any', 1, 5,
       'Jerusalem', 'Ein Karem', 31.7670, 35.1620,
       'manual', null, 'seed_v3_051'),

      ('חדר בדירה אומנותית בעיר העתיקה',
       'חדר בדירה ייחודית עם 2 שותפות אמניות.',
       3200, 15, 3, 2, false, false, false, 'full',
       false, false, false, 12, current_date + interval '30 days',
       60, 3000, 200, 2, 'student', 'secular', 'any', 2, 4,
       'Jerusalem', 'Old City Jewish Quarter', 31.7755, 35.2317,
       'facebook', 'https://www.facebook.com/groups/bezalel.dirot/permalink/11001', 'seed_v3_052'),

      -- ============================================================
      -- MORE TEL AVIV (TAU additional + Reichman commuters)
      -- ============================================================
      ('דירת 3 חדרים ביד אליהו',
       'דירה גדולה במחיר נוח, גישה מהירה לתל אביב ולאוניברסיטה.',
       4800, 72, 3, 2, true, true, false, 'full',
       true, true, false, 12, current_date,
       100, 1500, 250, 2, 'student', 'mixed', 'any', 3, 3,
       'Tel Aviv', 'Yad Eliyahu', 32.0530, 34.7900,
       'yad2', 'https://www.yad2.co.il/realestate/item/tlv-yad-1101', 'seed_v3_053'),

      ('חדר ביד אליהו בדירת 5 שותפים',
       'חדר זול בדירה גדולה לסטודנטים, חיי קהילה תוססים.',
       2100, 14, 5, 1, false, true, true, 'partial',
       false, true, false, 12, current_date,
       80, 1700, 280, 4, 'student', 'mixed', 'any', 4, 3,
       'Tel Aviv', 'Yad Eliyahu', 32.0540, 34.7920,
       'facebook', 'https://www.facebook.com/groups/tlv.cheap.rent/permalink/11002', 'seed_v3_054'),

      ('דירת 2 חדרים בשפירא',
       'דירה משופצת בשכונה מתחדשת, גישה נוחה לפלורנטין.',
       4900, 50, 2, 3, true, false, false, 'partial',
       false, true, false, 12, current_date + interval '14 days',
       70, 950, 220, 1, 'student', 'secular', 'any', 3, 4,
       'Tel Aviv', 'Shapira', 32.0560, 34.7780,
       'yad2', 'https://www.yad2.co.il/realestate/item/tlv-shapira-1103', 'seed_v3_055'),

      -- ============================================================
      -- BAT YAM (cheaper TAU/HIT commuters)
      -- ============================================================
      ('דירת 3 חדרים בבת ים ליד הים',
       'דירה גדולה ליד החוף, 15 דקות באוטובוס לתל אביב.',
       4400, 78, 3, 4, true, true, false, 'full',
       true, true, false, 12, current_date,
       60, 2000, 200, 2, 'mixed', 'mixed', 'any', 3, 4,
       'Bat Yam', 'City Center', 32.0220, 34.7470,
       'yad2', 'https://www.yad2.co.il/realestate/item/byam-1201', 'seed_v3_056'),

      ('חדר בדירה לסטודנטים בבת ים',
       'חדר זול בדירה לארבעה סטודנטים, ליד הים.',
       1900, 15, 4, 2, false, false, true, 'partial',
       false, true, false, 12, current_date,
       70, 2200, 250, 3, 'student', 'secular', 'any', 4, 3,
       'Bat Yam', 'Ramat Yosef', 32.0190, 34.7450,
       'facebook', 'https://www.facebook.com/groups/batyam.students/permalink/12001', 'seed_v3_057'),

      -- ============================================================
      -- MORE FACEBOOK GROUP STYLE LISTINGS (mixed cities)
      -- ============================================================
      ('דירת שותפים בגליל - חינמי לחיילים',
       'דירה זולה לחיילים וסטודנטים, אווירה משפחתית.',
       1800, 60, 4, 1, true, false, false, 'partial',
       true, false, false, 12, current_date,
       120, 15000, 600, 3, 'mixed', 'mixed', 'any', 2, 4,
       'Kiryat Shmona', 'Center', 33.2080, 35.5700,
       'facebook', 'https://www.facebook.com/groups/north.dirot/permalink/13001', 'seed_v3_058'),

      ('חדר בדירת 3 שותפות באשדוד',
       'חדר בדירה לבנות, גישה לאשדוד וליד הים.',
       2200, 15, 3, 2, false, false, false, 'full',
       true, true, false, 12, current_date,
       50, 1500, 200, 2, 'student', 'mixed', 'female', 2, 5,
       'Ashdod', 'Rova Yud Aleph', 31.8050, 34.6420,
       'facebook', 'https://www.facebook.com/groups/ashdod.dirot/permalink/13002', 'seed_v3_059'),

      ('דירת 5 חדרים יוקרתית בכפר סבא',
       'דירת יוקרה לקבוצת חברים, נוף לפארק, כל המוצרים.',
       7800, 130, 5, 6, true, true, false, 'full',
       true, true, true, 24, current_date + interval '45 days',
       80, 1100, 400, 4, 'professional', 'secular', 'any', 1, 5,
       'Kfar Saba', 'Center', 32.1740, 34.9070,
       'yad2', 'https://www.yad2.co.il/realestate/item/ksba-1301', 'seed_v3_060')

    on conflict (source, external_id) where external_id is not null
    do update set
      title = excluded.title,
      description = excluded.description,
      price_nis = excluded.price_nis,
      is_active = true
    returning id, external_id
  )
-- =====================================================================
-- Junction rows: pair each seeded listing with its nearest universities + distances (m)
-- =====================================================================
insert into public.listing_universities (listing_id, university_id, distance_m)
select i.id, u.id, dist::int
from inserted i
join (values
  -- Tel Aviv area
  ('seed_v3_001', 'Tel Aviv University',          450),
  ('seed_v3_002', 'Tel Aviv University',          280),
  ('seed_v3_003', 'Tel Aviv University',         3800),
  ('seed_v3_003', 'Reichman University',         9500),
  ('seed_v3_004', 'Tel Aviv University',         4500),
  ('seed_v3_005', 'Tel Aviv University',         5800),
  ('seed_v3_006', 'Tel Aviv University',         7200),
  ('seed_v3_006', 'Holon Institute of Technology', 4900),
  ('seed_v3_007', 'Tel Aviv University',         5200),
  ('seed_v3_008', 'Tel Aviv University',         4100),
  ('seed_v3_008', 'Bar-Ilan University',         3800),
  ('seed_v3_009', 'Tel Aviv University',         5400),
  ('seed_v3_010', 'Tel Aviv University',          550),
  ('seed_v3_053', 'Tel Aviv University',         5300),
  ('seed_v3_053', 'Holon Institute of Technology', 4200),
  ('seed_v3_054', 'Tel Aviv University',         5500),
  ('seed_v3_055', 'Tel Aviv University',         6100),

  -- Jerusalem
  ('seed_v3_011', 'Hebrew University of Jerusalem', 1600),
  ('seed_v3_012', 'Hebrew University of Jerusalem', 2400),
  ('seed_v3_012', 'Bezalel Academy',                500),
  ('seed_v3_013', 'Hebrew University of Jerusalem', 1900),
  ('seed_v3_014', 'Hebrew University of Jerusalem', 3200),
  ('seed_v3_015', 'Hebrew University of Jerusalem', 2800),
  ('seed_v3_015', 'Bezalel Academy',               1900),
  ('seed_v3_016', 'Hebrew University of Jerusalem', 2700),
  ('seed_v3_017', 'Hebrew University of Jerusalem', 3500),
  ('seed_v3_018', 'Hebrew University of Jerusalem', 2100),
  ('seed_v3_051', 'Bezalel Academy',               6200),
  ('seed_v3_051', 'Hebrew University of Jerusalem', 5400),
  ('seed_v3_052', 'Bezalel Academy',               3100),

  -- Haifa
  ('seed_v3_019', 'Technion',                       280),
  ('seed_v3_020', 'Technion',                       380),
  ('seed_v3_021', 'University of Haifa',           1100),
  ('seed_v3_022', 'University of Haifa',           4800),
  ('seed_v3_022', 'Technion',                      5200),
  ('seed_v3_023', 'University of Haifa',            900),
  ('seed_v3_024', 'Technion',                      1900),
  ('seed_v3_025', 'University of Haifa',           5500),
  ('seed_v3_025', 'Technion',                      4600),
  ('seed_v3_026', 'Technion',                      3400),

  -- Beer Sheva
  ('seed_v3_027', 'Ben-Gurion University',          250),
  ('seed_v3_028', 'Ben-Gurion University',          350),
  ('seed_v3_029', 'Ben-Gurion University',          400),
  ('seed_v3_030', 'Ben-Gurion University',          500),
  ('seed_v3_031', 'Ben-Gurion University',         3200),
  ('seed_v3_032', 'Ben-Gurion University',         4500),

  -- Bar-Ilan
  ('seed_v3_033', 'Bar-Ilan University',            450),
  ('seed_v3_034', 'Bar-Ilan University',           1700),
  ('seed_v3_035', 'Bar-Ilan University',           3300),
  ('seed_v3_036', 'Bar-Ilan University',            520),
  ('seed_v3_037', 'Bar-Ilan University',           2700),

  -- Reichman / Open Uni / Holon
  ('seed_v3_038', 'Reichman University',            850),
  ('seed_v3_039', 'Reichman University',            420),
  ('seed_v3_040', 'Open University of Israel',      300),
  ('seed_v3_041', 'Open University of Israel',      900),
  ('seed_v3_042', 'Holon Institute of Technology',  400),
  ('seed_v3_043', 'Holon Institute of Technology',  1500),
  ('seed_v3_044', 'Holon Institute of Technology',  1700),

  -- Ariel
  ('seed_v3_045', 'Ariel University',               350),
  ('seed_v3_046', 'Ariel University',               550),
  ('seed_v3_047', 'Ariel University',               700),

  -- Sapir
  ('seed_v3_048', 'Sapir Academic College',         800),
  ('seed_v3_049', 'Sapir Academic College',         900),
  ('seed_v3_050', 'Sapir Academic College',       12000),

  -- Bat Yam (commuter for TAU + HIT)
  ('seed_v3_056', 'Holon Institute of Technology', 4800),
  ('seed_v3_056', 'Tel Aviv University',          11000),
  ('seed_v3_057', 'Holon Institute of Technology', 5100),

  -- Misc
  ('seed_v3_058', 'University of Haifa',          43000),
  ('seed_v3_059', 'Ben-Gurion University',        58000),
  ('seed_v3_060', 'Open University of Israel',     2200),
  ('seed_v3_060', 'Bar-Ilan University',          11000)
) as t(ext_id, uni_en, dist) on t.ext_id = i.external_id
join uni u on u.name_en = t.uni_en
on conflict (listing_id, university_id)
do update set distance_m = excluded.distance_m;
