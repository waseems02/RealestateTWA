const campusProfiles = [
  {
    city: "ירושלים",
    city_en: "Jerusalem",
    campus: "האוניברסיטה העברית - הר הצופים",
    neighborhood: "הגבעה הצרפתית",
    street: "אזור ההגנה",
    lat: 31.7982,
    lng: 35.2427,
    roomPrice: 2450,
    apartmentPrice: 5100,
    bus: "תחנת אוטובוס הר הצופים",
    train: "הרכבת הקלה - גבעת התחמושת",
    trainKm: 2.1
  },
  {
    city: "ירושלים",
    city_en: "Jerusalem",
    campus: "האוניברסיטה העברית - גבעת רם",
    neighborhood: "רחביה",
    street: "אזור עזה",
    lat: 31.7745,
    lng: 35.2142,
    roomPrice: 2850,
    apartmentPrice: 6400,
    bus: "תחנת אוטובוס גבעת רם",
    train: "הרכבת הקלה - מרכז העיר",
    trainKm: 1.6
  },
  {
    city: "תל אביב",
    city_en: "Tel Aviv",
    campus: "אוניברסיטת תל אביב",
    neighborhood: "רמת אביב",
    street: "אזור חיים לבנון",
    lat: 32.1139,
    lng: 34.8027,
    roomPrice: 3900,
    apartmentPrice: 7600,
    bus: "תחנת אוטובוס חיים לבנון",
    train: "תחנת רכבת אוניברסיטה",
    trainKm: 1.2
  },
  {
    city: "חיפה",
    city_en: "Haifa",
    campus: "אוניברסיטת חיפה",
    neighborhood: "אחוזה",
    street: "אזור חורב",
    lat: 32.777,
    lng: 35.0003,
    roomPrice: 2100,
    apartmentPrice: 4300,
    bus: "תחנת אוטובוס אוניברסיטת חיפה",
    train: "מרכזית חוף הכרמל",
    trainKm: 4.2
  },
  {
    city: "באר שבע",
    city_en: "Beer Sheva",
    campus: "אוניברסיטת בן גוריון בנגב",
    neighborhood: "שכונה ג",
    street: "אזור רגר",
    lat: 31.2628,
    lng: 34.7999,
    roomPrice: 1750,
    apartmentPrice: 3450,
    bus: "תחנת אוטובוס אוניברסיטת בן גוריון",
    train: "תחנת רכבת באר שבע צפון",
    trainKm: 1.1
  },
  {
    city: "רמת גן",
    city_en: "Ramat Gan",
    campus: "אוניברסיטת בר אילן",
    neighborhood: "רמת אילן",
    street: "אזור אלוף שדה",
    lat: 32.0684,
    lng: 34.8436,
    roomPrice: 2950,
    apartmentPrice: 5600,
    bus: "תחנת אוטובוס אוניברסיטת בר אילן",
    train: "תחנת רכבת בני ברק",
    trainKm: 2.7
  },
  {
    city: "אריאל",
    city_en: "Ariel",
    campus: "אוניברסיטת אריאל",
    neighborhood: "מרכז אריאל",
    street: "אזור דרך הציונות",
    lat: 32.1048,
    lng: 35.2057,
    roomPrice: 1650,
    apartmentPrice: 2950,
    bus: "תחנת אוניברסיטת אריאל",
    train: "תחנת רכבת ראש העין צפון",
    trainKm: 13.0
  },
  {
    city: "רחובות",
    city_en: "Rehovot",
    campus: "הפקולטה לחקלאות - האוניברסיטה העברית",
    neighborhood: "רחובות המדע",
    street: "אזור הרצל",
    lat: 31.9072,
    lng: 34.8089,
    roomPrice: 2500,
    apartmentPrice: 4700,
    bus: "תחנת אוטובוס הפקולטה לחקלאות",
    train: "תחנת רכבת רחובות",
    trainKm: 1.4
  },
  {
    city: "הרצליה",
    city_en: "Herzliya",
    campus: "אוניברסיטת רייכמן",
    neighborhood: "הרצליה ב",
    street: "אזור כנפי נשרים",
    lat: 32.1668,
    lng: 34.8123,
    roomPrice: 3400,
    apartmentPrice: 6800,
    bus: "תחנת אוטובוס רייכמן",
    train: "תחנת רכבת הרצליה",
    trainKm: 2.2
  },
  {
    city: "חולון",
    city_en: "Holon",
    campus: "המכון הטכנולוגי חולון",
    neighborhood: "קריית שרת",
    street: "אזור גולומב",
    lat: 32.017,
    lng: 34.778,
    roomPrice: 2600,
    apartmentPrice: 5000,
    bus: "תחנת אוטובוס HIT",
    train: "תחנת רכבת קוממיות",
    trainKm: 2.1
  },
  {
    city: "נתניה",
    city_en: "Netanya",
    campus: "המכללה האקדמית נתניה",
    neighborhood: "קריית השרון",
    street: "אזור האוניברסיטה",
    lat: 32.3075,
    lng: 34.8796,
    roomPrice: 2450,
    apartmentPrice: 4700,
    bus: "תחנת אוטובוס המכללה האקדמית נתניה",
    train: "תחנת רכבת נתניה",
    trainKm: 2.8
  },
  {
    city: "ירושלים",
    city_en: "Jerusalem",
    campus: "בצלאל אקדמיה לאמנות ועיצוב",
    neighborhood: "נחלאות",
    street: "אזור בצלאל",
    lat: 31.782,
    lng: 35.209,
    roomPrice: 2750,
    apartmentPrice: 5900,
    bus: "תחנת אוטובוס בצלאל",
    train: "הרכבת הקלה - מרכז העיר",
    trainKm: 1.2
  }
];

const lifestyleOptions = [
  "no_preference",
  "quiet_lifestyle",
  "traditional_friendly",
  "student_friendly"
];

const sourceTypes = [
  "manual_demo",
  "university_board_demo",
  "facebook_group_demo",
  "yad2_demo",
  "public_source_demo"
];

function buildListing(profile, index) {
  const isRoom = index % 2 === 1;
  const offset = index - 3;
  const price = isRoom
    ? profile.roomPrice + index * 90
    : profile.apartmentPrice + index * 180;
  const rooms = isRoom ? 1 : index % 3 === 0 ? 2.5 : index % 3 === 1 ? 3 : 4;
  const roommates = isRoom ? (index % 3) + 1 : index % 2 === 0 ? 0 : 2;

  return {
    id: `demo-${profile.city_en.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    title: isRoom
      ? `חדר מרוהט ליד ${profile.campus}`
      : `דירת ${rooms} חדרים מתאימה לסטודנטים ב${profile.neighborhood}`,
    description: `מודעת דמו אקדמית בלבד. ${isRoom ? "חדר בדירת שותפים" : "דירה מלאה"} באזור ${profile.neighborhood}, עם גישה נוחה לקמפוס ולתחבורה ציבורית.`,
    listing_type: isRoom ? "room" : "apartment",
    city: profile.city,
    city_en: profile.city_en,
    neighborhood: profile.neighborhood,
    street: profile.street,
    latitude: Number((profile.lat + offset * 0.0011).toFixed(7)),
    longitude: Number((profile.lng + offset * 0.0013).toFixed(7)),
    price,
    rooms,
    floor: (index % 6) + 1,
    size_sqm: isRoom ? 13 + index : 42 + index * 8,
    balcony: index % 2 === 0,
    elevator: index % 3 === 0,
    parking: index % 4 === 0,
    air_conditioning: true,
    furnished: isRoom || index % 3 !== 0,
    pets_allowed: index % 5 === 0,
    suitable_for_roommates: isRoom || index % 2 === 0,
    current_roommates_count: roommates,
    roommates,
    smoking_allowed: index % 6 === 0,
    lifestyle_tradition_preference: lifestyleOptions[index % lifestyleOptions.length],
    campus: profile.campus,
    campus_name: profile.campus,
    distance_to_campus_km: Number((0.35 + index * 0.28).toFixed(2)),
    distance_to_campus_minutes: 6 + index * 3,
    distance_to_bus_station_m: 70 + index * 35,
    distance_to_bus_minutes: Math.max(2, Math.round((70 + index * 35) / 80)),
    distance_to_train_station_km: Number((profile.trainKm + index * 0.12).toFixed(2)),
    distance_to_train_minutes: Math.round((profile.trainKm + index * 0.12) * 12),
    nearest_bus_station: profile.bus,
    nearest_train_station: profile.train,
    near_public_transportation: true,
    available_from: new Date(Date.UTC(2026, 6, 1 + index * 3)).toISOString().slice(0, 10),
    contact_name: "איש קשר דמו",
    contact_phone: `050-700${String(index).padStart(4, "0")}`,
    contact_email: `demo-${profile.city_en.toLowerCase().replace(/\s+/g, "-")}-${index}@example.com`,
    source_type: sourceTypes[index % sourceTypes.length],
    status: "active"
  };
}

const demoListings = campusProfiles.flatMap((profile) =>
  Array.from({ length: 5 }, (_, i) => buildListing(profile, i + 1))
);

module.exports = { demoListings };
