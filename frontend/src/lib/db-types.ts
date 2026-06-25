export type Furnished = "none" | "partial" | "full";
export type RoommateStatus = "student" | "professional" | "mixed";
export type ReligiousTag = "secular" | "traditional" | "religious" | "mixed";
export type ListingSource = "yad2" | "facebook" | "manual" | "other";
export type GenderPreference = "any" | "male" | "female";

export interface University {
  id: string;
  name_en: string;
  name_he: string;
  city: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price_nis: number;
  size_sqm: number | null;
  rooms: number | null;
  floor: number | null;
  has_balcony: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  furnished: Furnished;
  parking_available: boolean;
  air_conditioning: boolean;
  accessible: boolean;
  lease_months: number | null;
  available_from: string | null;
  bus_stop_distance_m: number | null;
  train_station_distance_m: number | null;
  nearest_supermarket_m: number | null;
  num_roommates: number;
  roommates_status: RoommateStatus | null;
  roommates_religious_tag: ReligiousTag | null;
  gender_preference: GenderPreference;
  noise_level: number | null;
  safety_rating: number | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  source: ListingSource;
  source_url: string | null;
  external_id: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  is_active: boolean;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingUniversityJoin {
  distance_m: number;
  universities: Pick<University, "id" | "name_en" | "name_he" | "city"> | null;
}

export interface ListingWithUniversities extends Listing {
  listing_universities: ListingUniversityJoin[];
}

export interface Database {
  public: {
    Tables: {
      universities: { Row: University; Insert: Partial<University>; Update: Partial<University> };
      listings: { Row: Listing; Insert: Partial<Listing>; Update: Partial<Listing> };
      listing_universities: {
        Row: { listing_id: string; university_id: string; distance_m: number };
        Insert: { listing_id: string; university_id: string; distance_m: number };
        Update: Partial<{ distance_m: number }>;
      };
    };
    Enums: {
      furnished_enum: Furnished;
      roommate_status_enum: RoommateStatus;
      religious_tag_enum: ReligiousTag;
      listing_source_enum: ListingSource;
      gender_preference_enum: GenderPreference;
    };
  };
}
