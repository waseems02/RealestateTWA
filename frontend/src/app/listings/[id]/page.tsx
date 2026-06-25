import { notFound } from "next/navigation";
import he from "../../../../messages/he.json";
import { CITY_LABELS_HE } from "@/lib/constants";
import type { ListingWithUniversities, ReligiousTag, Furnished } from "@/lib/db-types";
import { StickyCta } from "./_components/sticky-cta";

async function getListing(id: string): Promise<ListingWithUniversities | null> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("listings")
      .select(`*, listing_universities ( distance_m, universities ( id, name_en, name_he, city ) )`)
      .eq("id", id)
      .eq("is_active", true)
      .single();
    return data as unknown as ListingWithUniversities | null;
  } catch {
    return null;
  }
}

const GALLERY_GRADIENTS = [
  "from-primary/25 to-primary/10",
  "from-brand-coral/20 to-brand-coral/5",
  "from-surface-container-highest to-surface-container-low",
  "from-primary-fixed to-surface-container",
];

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const cityLabel = listing.city ? (CITY_LABELS_HE[listing.city] ?? listing.city) : "";
  const nearest = [...(listing.listing_universities ?? [])]
    .sort((a, b) => a.distance_m - b.distance_m)[0] ?? null;

  return (
    <>
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-32 pt-6">
        {/* Gallery */}
        <section className="grid grid-cols-4 grid-rows-2 gap-2 h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
          {GALLERY_GRADIENTS.map((grad, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${grad} flex items-center justify-center ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <span className="text-4xl font-black text-on-surface/10">{listing.title.slice(0, i === 0 ? 2 : 1)}</span>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-[1fr_22rem] gap-10">
          {/* Left column */}
          <div className="space-y-8">
            {/* Title + price */}
            <div>
              <h1 className="text-3xl font-bold text-on-surface">{listing.title}</h1>
              {(cityLabel || listing.neighborhood) && (
                <p className="mt-1 text-on-surface-variant">
                  {[listing.neighborhood, cityLabel].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="mt-4 text-4xl font-black text-on-surface">
                ₪{listing.price_nis.toLocaleString("he-IL")}
                <span className="text-base font-normal text-on-surface-variant"> {he.card.month}</span>
              </p>
            </div>

            {/* Key facts grid */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listing.rooms != null && (
                <FactCard icon="🚪" label={he.card.rooms} value={String(listing.rooms)} />
              )}
              {listing.size_sqm != null && (
                <FactCard icon="📐" label={he.card.sqm} value={`${listing.size_sqm} מ"ר`} />
              )}
              {listing.floor != null && (
                <FactCard icon="🏢" label={he.card.floor} value={String(listing.floor)} />
              )}
              <FactCard icon="🛋️" label={he.filters.furnished} value={furnishedLabel(listing.furnished)} />
              {listing.lease_months != null && (
                <FactCard icon="📋" label="חוזה" value={`${listing.lease_months} חודשים`} />
              )}
              {listing.available_from != null && (
                <FactCard
                  icon="📅"
                  label={he.card.available_from}
                  value={
                    new Date(listing.available_from) <= new Date()
                      ? he.card.available_now
                      : new Date(listing.available_from).toLocaleDateString("he-IL")
                  }
                />
              )}
            </section>

            {/* Amenities */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-on-surface">{he.filters.amenities}</h2>
              <div className="flex flex-wrap gap-3">
                <AmenityChip icon="🏗️" label="מרפסת" active={listing.has_balcony} />
                <AmenityChip icon="🐾" label="חיות מחמד" active={listing.pets_allowed} />
                <AmenityChip icon="🚬" label="עישון" active={listing.smoking_allowed} />
                <AmenityChip icon="❄️" label="מזגן" active={listing.air_conditioning} />
                <AmenityChip icon="🅿️" label="חניה" active={listing.parking_available} />
                <AmenityChip icon="♿" label="נגיש" active={listing.accessible} />
              </div>
            </section>

            {/* Roommates */}
            <section className="space-y-3 rounded-2xl bg-surface-container-low p-5">
              <h2 className="text-lg font-semibold text-on-surface">{he.filters.roommates_section}</h2>
              <div className="flex flex-wrap gap-3">
                <InfoPill icon="👥" label={`${listing.num_roommates} שותפים`} />
                {listing.roommates_status && (
                  <InfoPill
                    icon="🎓"
                    label={
                      listing.roommates_status === "student"
                        ? he.filters.status_student
                        : listing.roommates_status === "professional"
                        ? he.filters.status_professional
                        : he.filters.status_mixed
                    }
                  />
                )}
                {listing.roommates_religious_tag && (
                  <InfoPill icon="✡️" label={religiousLabel(listing.roommates_religious_tag)} />
                )}
                {listing.gender_preference !== "any" && (
                  <InfoPill
                    icon="👤"
                    label={listing.gender_preference === "female" ? he.filters.gender_female : he.filters.gender_male}
                  />
                )}
              </div>
            </section>

            {/* Description */}
            {listing.description && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-on-surface">תיאור</h2>
                <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </section>
            )}
          </div>

          {/* Right column — Location */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-outline-variant overflow-hidden">
              {/* Map placeholder — will be replaced by Leaflet in map PR */}
              <div className="h-52 bg-surface-container flex items-center justify-center">
                <div className="text-center text-on-surface-variant">
                  <div className="text-4xl mb-2">📍</div>
                  <p className="text-sm">
                    {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h2 className="font-semibold text-on-surface">מרחקים</h2>
                {nearest && (
                  <DistRow icon="🎓" label={nearest.universities?.name_he ?? "קמפוס"} dist={nearest.distance_m} />
                )}
                {listing.bus_stop_distance_m != null && (
                  <DistRow icon="🚌" label="תחנת אוטובוס" dist={listing.bus_stop_distance_m} />
                )}
                {listing.train_station_distance_m != null && (
                  <DistRow icon="🚆" label="תחנת רכבת" dist={listing.train_station_distance_m} />
                )}
                {listing.nearest_supermarket_m != null && (
                  <DistRow icon="🛒" label="סופרמרקט" dist={listing.nearest_supermarket_m} />
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky CTA */}
      <StickyCta contactName={listing.contact_name} price={listing.price_nis} />
    </>
  );
}

function FactCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4 flex flex-col items-center text-center gap-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
      <span className="font-bold text-on-surface">{value}</span>
    </div>
  );
}

function AmenityChip({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-surface-container text-on-surface-variant border-outline-variant line-through opacity-50"
      }`}
    >
      <span>{icon}</span> {label}
    </span>
  );
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-outline-variant text-on-surface">
      <span>{icon}</span> {label}
    </span>
  );
}

function DistRow({ icon, label, dist }: { icon: string; label: string; dist: number }) {
  const formatted = dist >= 1000 ? `${(dist / 1000).toFixed(1)} ק"מ` : `${dist} מ'`;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-on-surface-variant">
        <span>{icon}</span> {label}
      </span>
      <span className="font-semibold text-on-surface">{formatted}</span>
    </div>
  );
}

function furnishedLabel(f: Furnished): string {
  if (f === "full") return he.filters.furnished_full;
  if (f === "partial") return he.filters.furnished_partial;
  return he.filters.furnished_none;
}

function religiousLabel(tag: ReligiousTag): string {
  if (tag === "secular") return he.filters.religious_secular;
  if (tag === "traditional") return he.filters.religious_traditional;
  if (tag === "religious") return he.filters.religious_religious;
  return he.filters.religious_mixed;
}
