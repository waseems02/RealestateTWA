import Link from "next/link";

import he from "../../../messages/he.json";
import { PAGE_SIZE } from "@/lib/constants";
import type { ListingWithUniversities } from "@/lib/db-types";
import { FiltersForm } from "./_components/filters-form";
import { ListingCard } from "./_components/listing-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v && v.length > 0 ? v : undefined;
}
function pickInt(v: string | string[] | undefined): number | undefined {
  const s = pickStr(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}
function pickBool(v: string | string[] | undefined): boolean | undefined {
  const s = pickStr(v);
  return s === "1" ? true : undefined;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const city = pickStr(sp.city);
  const min_price = pickInt(sp.min_price);
  const max_price = pickInt(sp.max_price);
  const min_rooms = pickInt(sp.min_rooms);
  const min_sqm = pickInt(sp.min_sqm);
  const has_balcony = pickBool(sp.has_balcony);
  const pets_allowed = pickBool(sp.pets_allowed);
  const smoking_allowed = pickBool(sp.smoking_allowed);
  const parking_available = pickBool(sp.parking_available);
  const air_conditioning = pickBool(sp.air_conditioning);
  const accessible = pickBool(sp.accessible);
  const furnished = pickStr(sp.furnished);
  const roommates_status = pickStr(sp.roommates_status);
  const religious = pickStr(sp.religious);
  const gender = pickStr(sp.gender);
  const max_bus = pickInt(sp.max_bus);
  const max_train = pickInt(sp.max_train);
  const page = Math.max(1, pickInt(sp.page) ?? 1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let data: unknown[] | null = null;
  let count: number | null = null;
  let errorMessage: string | null = null;

  try {
    const { supabase } = await import("@/lib/supabase");
    let query = supabase
      .from("listings")
      .select(
        `*, listing_universities ( distance_m, universities ( id, name_en, name_he, city ) )`,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (city) query = query.eq("city", city);
    if (min_price !== undefined) query = query.gte("price_nis", min_price);
    if (max_price !== undefined) query = query.lte("price_nis", max_price);
    if (min_rooms !== undefined) query = query.gte("rooms", min_rooms);
    if (min_sqm !== undefined) query = query.gte("size_sqm", min_sqm);
    if (has_balcony) query = query.eq("has_balcony", true);
    if (pets_allowed) query = query.eq("pets_allowed", true);
    if (smoking_allowed) query = query.eq("smoking_allowed", true);
    if (parking_available) query = query.eq("parking_available", true);
    if (air_conditioning) query = query.eq("air_conditioning", true);
    if (accessible) query = query.eq("accessible", true);
    if (furnished && furnished !== "any") query = query.eq("furnished", furnished);
    if (roommates_status && roommates_status !== "any")
      query = query.eq("roommates_status", roommates_status);
    if (religious && religious !== "any")
      query = query.eq("roommates_religious_tag", religious);
    if (gender && gender !== "any") query = query.eq("gender_preference", gender);
    if (max_bus !== undefined) query = query.lte("bus_stop_distance_m", max_bus);
    if (max_train !== undefined)
      query = query.lte("train_station_distance_m", max_train);

    const result = await query.range(from, to);
    data = result.data;
    count = result.count;
    errorMessage = result.error?.message ?? null;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown error";
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-bold text-red-600">
          שגיאה בטעינת דירות
        </h1>
        <pre className="mt-4 whitespace-pre-wrap rounded bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </pre>
      </main>
    );
  }

  const listings = (data ?? []) as unknown as ListingWithUniversities[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resultLabel =
    total === 1
      ? he.listings.result_count_one
      : he.listings.result_count_many.replace("{count}", String(total));

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            {he.listings.title}
          </h1>
          <span className="text-sm text-on-surface-variant">{resultLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            name="sort"
            defaultValue={pickStr(sp.sort)}
            form="sort-form"
            className="text-sm rounded-full border border-outline-variant px-3 py-2 bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="">מיון: חדש ביותר</option>
            <option value="price_asc">מחיר: נמוך לגבוה</option>
            <option value="price_desc">מחיר: גבוה לנמוך</option>
          </select>
          <Link
            href={`/map`}
            className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
          >
            🗺️ מפה
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
        <aside className="lg:sticky lg:top-6 self-start">
          <FiltersForm initial={sp} />
        </aside>

        <section>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-16 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg font-medium text-on-surface">
                {he.listings.no_results}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {he.listings.no_results_hint}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4">
              <PaginationLink
                disabled={page <= 1}
                href={hrefForPage(sp, page - 1)}
                label={he.listings.prev}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {he.listings.page_of
                  .replace("{page}", String(page))
                  .replace("{total}", String(totalPages))}
              </span>
              <PaginationLink
                disabled={page >= totalPages}
                href={hrefForPage(sp, page + 1)}
                label={he.listings.next}
              />
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

function hrefForPage(
  sp: Record<string, string | string[] | undefined>,
  page: number
): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (typeof v === "string" && v) usp.set(k, v);
  }
  if (page > 1) usp.set("page", String(page));
  const qs = usp.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

function PaginationLink({
  disabled,
  href,
  label,
}: {
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-700">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      {label}
    </Link>
  );
}
