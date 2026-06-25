import Link from "next/link";
import he from "../../messages/he.json";
import { CITY_LABELS_HE, ISRAELI_CITIES } from "@/lib/constants";
import type { ListingWithUniversities } from "@/lib/db-types";

async function getFeatured(): Promise<ListingWithUniversities[]> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("listings")
      .select(`*, listing_universities ( distance_m, universities ( id, name_en, name_he, city ) )`)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    return (data ?? []) as unknown as ListingWithUniversities[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <main className="hero-gradient overflow-hidden flex-1">
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pt-16 pb-16 md:pt-24 md:pb-28 flex flex-col items-center text-center">
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight mb-4">
            {he.home.hero_title}
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            {he.home.hero_subtitle}
          </p>
        </div>

        {/* Search bar — submits to /listings as GET */}
        <form
          action="/listings"
          method="GET"
          className="w-full max-w-4xl bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-[0_10px_30px_-4px_rgba(30,41,59,0.08)] flex flex-col md:flex-row items-center gap-2 md:gap-0"
        >
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 items-center px-4">
            <div className="flex items-center gap-2 border-b md:border-b-0 md:border-l border-outline-variant py-3">
              <span className="text-primary text-lg">🎓</span>
              <select
                name="city"
                defaultValue=""
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-on-surface"
              >
                <option value="">{he.home.search_city}</option>
                {ISRAELI_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {CITY_LABELS_HE[c] ?? c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 border-b md:border-b-0 md:border-l border-outline-variant py-3">
              <span className="text-primary">₪</span>
              <input
                name="max_price"
                type="number"
                placeholder={he.home.search_price}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
            <div className="flex items-center gap-2 py-3">
              <span className="text-primary text-lg">🚪</span>
              <input
                name="min_rooms"
                type="number"
                placeholder={he.home.search_rooms}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-brand-coral text-white font-bold px-10 py-3 rounded-full hover:scale-105 transition-all text-sm w-full md:w-auto"
          >
            {he.home.search_cta}
          </button>
        </form>

        <Link
          href="/listings"
          className="mt-10 flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-all bg-primary/10 px-5 py-2.5 rounded-full"
        >
          <span>✨</span>
          {he.home.ask_ai}
        </Link>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-semibold text-on-surface tracking-tight">
                {he.home.featured_title}
              </h2>
              <p className="text-base text-on-surface-variant mt-1">
                {he.home.featured_subtitle}
              </p>
            </div>
            <Link href="/listings" className="text-primary font-bold text-sm flex items-center gap-1">
              {he.home.view_all} ←
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((l) => (
              <FeaturedCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-surface-container-low/50 py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-on-surface tracking-tight">
              {he.home.how_title}
            </h2>
            <p className="text-base text-on-surface-variant mt-2">{he.home.how_subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <HowStep icon="🔍" title={he.home.step1_title} desc={he.home.step1_desc} accent="primary" />
            <HowStep icon="🤝" title={he.home.step2_title} desc={he.home.step2_desc} accent="coral" />
            <HowStep icon="🔑" title={he.home.step3_title} desc={he.home.step3_desc} accent="primary" />
          </div>
        </div>
      </section>
    </main>
  );
}

const CARD_GRADIENTS = [
  "from-primary/20 to-primary/5",
  "from-brand-coral/20 to-brand-coral/5",
  "from-surface-container-high to-surface-container",
  "from-primary-fixed to-surface",
];

function FeaturedCard({ listing }: { listing: ListingWithUniversities }) {
  const nearest = [...(listing.listing_universities ?? [])].sort(
    (a, b) => a.distance_m - b.distance_m
  )[0];
  const distLabel = nearest
    ? `${Math.round(nearest.distance_m / 100) / 10} ק"מ ${nearest.universities?.name_he ?? ""}`
    : null;
  const grad = CARD_GRADIENTS[listing.title.charCodeAt(0) % CARD_GRADIENTS.length];

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(30,41,59,0.08)] transition-all duration-300">
      <div className={`h-44 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <span className="text-4xl font-bold text-on-surface/20">{listing.title.slice(0, 2)}</span>
      </div>
      <div className="p-5">
        <p className="text-2xl font-bold text-on-surface">
          ₪{listing.price_nis.toLocaleString("he-IL")}
          <span className="text-xs font-normal text-on-surface-variant"> {he.card.month}</span>
        </p>
        <p className="text-on-surface-variant text-xs mt-1">
          {listing.rooms} {he.card.rooms} · {listing.size_sqm} {he.card.sqm}
          {listing.floor != null ? ` · קומה ${listing.floor}` : ""}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {listing.has_balcony && <Pill>מרפסת</Pill>}
          {listing.air_conditioning && <Pill>מזגן</Pill>}
          {listing.pets_allowed && <Pill>חיות מחמד</Pill>}
          {listing.furnished === "full" && <Pill>מרוהט</Pill>}
          {listing.roommates_status && (
            <Pill tone="muted">
              {listing.roommates_status === "student"
                ? "סטודנטים"
                : listing.roommates_status === "professional"
                ? "עובדים"
                : "מעורב"}
            </Pill>
          )}
          {listing.roommates_religious_tag && listing.roommates_religious_tag !== "mixed" && (
            <Pill tone="muted">
              {listing.roommates_religious_tag === "secular"
                ? "חילוני"
                : listing.roommates_religious_tag === "traditional"
                ? "מסורתי"
                : "דתי"}
            </Pill>
          )}
        </div>

        {distLabel && (
          <p className="mt-3 flex items-center gap-1 text-on-surface-variant text-xs">
            <span>📍</span> {distLabel}
          </p>
        )}
      </div>
    </article>
  );
}

function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        tone === "muted"
          ? "bg-surface-container-highest text-on-surface-variant"
          : "bg-primary/10 text-primary"
      }`}
    >
      {children}
    </span>
  );
}

function HowStep({
  icon,
  title,
  desc,
  accent,
}: {
  icon: string;
  title: string;
  desc: string;
  accent: "primary" | "coral";
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl ${
          accent === "coral" ? "bg-brand-coral/10" : "bg-primary/10"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}
