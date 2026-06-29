import type { Listing } from "@/lib/db-types";
import MapClientDynamic from "./_components/map-client-dynamic";

async function getListings(): Promise<Listing[]> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("listings")
      .select("id, title, price_nis, rooms, size_sqm, latitude, longitude, city, neighborhood, has_balcony, pets_allowed, roommates_status, roommates_religious_tag, bus_stop_distance_m")
      .eq("is_active", true)
      .limit(200);
    return (data ?? []) as Listing[];
  } catch {
    return [];
  }
}

export default async function MapPage() {
  const listings = await getListings();
  return <MapClientDynamic listings={listings} />;
}
