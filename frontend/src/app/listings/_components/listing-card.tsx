"use client";

import Link from "next/link";
import { useState } from "react";
import he from "../../../../messages/he.json";
import { CITY_LABELS_HE } from "@/lib/constants";
import type { ListingWithUniversities } from "@/lib/db-types";

const CARD_GRADIENTS = [
  "from-primary/15 to-primary/5",
  "from-brand-coral/15 to-brand-coral/5",
  "from-surface-container-high to-surface-container-low",
  "from-primary-fixed to-surface",
];

export function ListingCard({ listing }: { listing: ListingWithUniversities }) {
  const [saved, setSaved] = useState(false);
  const cityLabel = listing.city ? (CITY_LABELS_HE[listing.city] ?? listing.city) : "";
  const nearest = nearestUniversity(listing);
  const grad = CARD_GRADIENTS[listing.title.charCodeAt(0) % CARD_GRADIENTS.length];

  return (
    <article className="flex flex-col rounded-2xl bg-white overflow-hidden shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(30,41,59,0.08)] transition-all duration-300 group">
      {/* Photo / placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden`}>
        <span className="text-5xl font-black text-on-surface/10 group-hover:scale-110 transition-transform duration-500">
          {listing.title.slice(0, 2)}
        </span>
        <button
          aria-label="שמור דירה"
          onClick={() => setSaved((s) => !s)}
          className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-full transition-transform hover:scale-110"
        >
          <span className={`text-lg ${saved ? "text-brand-coral" : "text-on-surface-variant"}`}>
            {saved ? "♥" : "♡"}
          </span>
        </button>
        {listing.available_from && new Date(listing.available_from) > new Date() && (
          <span className="absolute bottom-3 right-3 bg-white/90 text-on-surface text-xs font-semibold px-2 py-1 rounded-full">
            {he.card.available_from} {new Date(listing.available_from).toLocaleDateString("he-IL")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xl font-bold text-on-surface">
            ₪{listing.price_nis.toLocaleString("he-IL")}
            <span className="text-xs font-normal text-on-surface-variant"> {he.card.month}</span>
          </p>
          {(cityLabel || listing.neighborhood) && (
            <p className="text-xs text-on-surface-variant mt-0.5">
              {[listing.neighborhood, cityLabel].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Key facts */}
        <p className="text-xs text-on-surface-variant">
          {listing.rooms != null && `${listing.rooms} ${he.card.rooms}`}
          {listing.size_sqm != null && ` · ${listing.size_sqm} ${he.card.sqm}`}
          {listing.floor != null && ` · קומה ${listing.floor}`}
        </p>

        {/* Amenity icons */}
        <div className="flex gap-1.5 flex-wrap">
          {listing.has_balcony && <AmenityIcon icon="🏗️" label="מרפסת" />}
          {listing.air_conditioning && <AmenityIcon icon="❄️" label="מזגן" />}
          {listing.parking_available && <AmenityIcon icon="🅿️" label="חניה" />}
          {listing.pets_allowed && <AmenityIcon icon="🐾" label="חיות" />}
          {listing.furnished !== "none" && (
            <AmenityIcon icon="🛋️" label={listing.furnished === "full" ? "מרוהט" : "חלקי"} />
          )}
        </div>

        {/* Roommate tags */}
        <div className="flex gap-1.5 flex-wrap">
          {listing.roommates_status && (
            <Tag>{listing.roommates_status === "student" ? "סטודנטים" : listing.roommates_status === "professional" ? "עובדים" : "מעורב"}</Tag>
          )}
          {listing.roommates_religious_tag && listing.roommates_religious_tag !== "mixed" && (
            <Tag>{listing.roommates_religious_tag === "secular" ? "חילוני" : listing.roommates_religious_tag === "traditional" ? "מסורתי" : "דתי"}</Tag>
          )}
          {listing.gender_preference !== "any" && (
            <Tag tone="pink">{listing.gender_preference === "female" ? "לנשים בלבד" : "לגברים בלבד"}</Tag>
          )}
        </div>

        {/* Distance badges */}
        <div className="flex gap-2 flex-wrap mt-auto pt-2 border-t border-outline-variant/40">
          {nearest && (
            <DistBadge icon="🎓" label={`${formatDist(nearest.distance_m)} ${nearest.name}`} />
          )}
          {listing.bus_stop_distance_m != null && (
            <DistBadge icon="🚌" label={formatDist(listing.bus_stop_distance_m)} />
          )}
          {listing.train_station_distance_m != null && (
            <DistBadge icon="🚆" label={formatDist(listing.train_station_distance_m)} />
          )}
        </div>
      </div>

      <Link
        href={`/listings/${listing.id}`}
        className="block text-center text-xs font-bold text-primary py-3 border-t border-outline-variant/40 hover:bg-primary/5 transition-colors"
      >
        לפרטים המלאים →
      </Link>
    </article>
  );
}

function AmenityIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <span title={label} className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1">
      <span>{icon}</span> {label}
    </span>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "pink" }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone === "pink" ? "bg-brand-coral/10 text-brand-coral" : "bg-surface-container-highest text-on-surface-variant"}`}>
      {children}
    </span>
  );
}

function DistBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
      <span>{icon}</span> {label}
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

function formatDist(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ק"מ`;
  return `${m} מ'`;
}
