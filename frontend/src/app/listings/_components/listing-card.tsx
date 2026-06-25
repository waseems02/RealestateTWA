import he from "../../../../messages/he.json";
import { CITY_LABELS_HE } from "@/lib/constants";
import type { ListingWithUniversities } from "@/lib/db-types";

export function ListingCard({ listing }: { listing: ListingWithUniversities }) {
  const cityLabel = listing.city ? CITY_LABELS_HE[listing.city] ?? listing.city : "";
  const nearest = nearestUniversity(listing);
  const roommatesLabel = roommatesText(listing.num_roommates);
  const availableLabel = availableText(listing.available_from);
  const priceLabel = `${listing.price_nis.toLocaleString("he-IL")} ${he.card.month}`;

  return (
    <article className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <header>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {listing.title}
        </h3>
        {(cityLabel || listing.neighborhood) && (
          <p className="mt-1 text-sm text-zinc-500">
            {[listing.neighborhood, cityLabel].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {priceLabel}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-700 dark:text-zinc-300">
        {listing.rooms !== null && (
          <Stat label={he.card.rooms} value={String(listing.rooms)} />
        )}
        {listing.size_sqm !== null && (
          <Stat label={he.card.sqm} value={String(listing.size_sqm)} />
        )}
        {listing.floor !== null && (
          <Stat label={he.card.floor} value={String(listing.floor)} />
        )}
        <Stat label="" value={roommatesLabel} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {listing.has_balcony && <Badge>מרפסת</Badge>}
        {listing.parking_available && <Badge>חניה</Badge>}
        {listing.air_conditioning && <Badge>מזגן</Badge>}
        {listing.furnished === "full" && <Badge>מרוהט</Badge>}
        {listing.furnished === "partial" && <Badge>מרוהט חלקית</Badge>}
        {listing.pets_allowed && <Badge>חיות מחמד</Badge>}
        {listing.accessible && <Badge>נגיש</Badge>}
        {listing.gender_preference === "female" && <Badge tone="pink">לנשים בלבד</Badge>}
        {listing.gender_preference === "male" && <Badge tone="blue">לגברים בלבד</Badge>}
        {listing.roommates_religious_tag && (
          <Badge tone="muted">{religiousLabel(listing.roommates_religious_tag)}</Badge>
        )}
      </div>

      <footer className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
        {nearest && (
          <p>
            {he.card.to_uni} {nearest.name} — {formatDistance(nearest.distance_m)}
          </p>
        )}
        {listing.bus_stop_distance_m !== null && (
          <p>אוטובוס: {formatDistance(listing.bus_stop_distance_m)}</p>
        )}
        <p>{availableLabel}</p>
      </footer>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted" | "pink" | "blue";
}) {
  const styles: Record<typeof tone, string> = {
    default:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    muted: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    pink: "bg-pink-50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    blue: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function nearestUniversity(l: ListingWithUniversities) {
  const rels = l.listing_universities ?? [];
  if (rels.length === 0) return null;
  const sorted = [...rels].sort((a, b) => a.distance_m - b.distance_m);
  const first = sorted[0];
  if (!first.universities) return null;
  return { name: first.universities.name_he, distance_m: first.distance_m };
}

function roommatesText(n: number): string {
  if (n === 0) return he.card.no_roommates;
  if (n === 1) return he.card.roommates_one;
  return he.card.roommates_many.replace("{count}", String(n));
}

function availableText(date: string | null): string {
  if (!date) return he.card.available_now;
  const d = new Date(date);
  if (d.getTime() <= Date.now()) return he.card.available_now;
  return `${he.card.available_from} ${d.toLocaleDateString("he-IL")}`;
}

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ק"מ`;
  return `${m} מ'`;
}

function religiousLabel(tag: string): string {
  switch (tag) {
    case "secular":
      return he.filters.religious_secular;
    case "traditional":
      return he.filters.religious_traditional;
    case "religious":
      return he.filters.religious_religious;
    case "mixed":
      return he.filters.religious_mixed;
    default:
      return tag;
  }
}
