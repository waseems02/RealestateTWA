"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/db-types";

type Filter = {
  maxPrice: number;
  rooms: string;
  balcony: boolean;
  pets: boolean;
  status: string;
  religious: string;
};

const DEFAULT_FILTER: Filter = {
  maxPrice: 15000,
  rooms: "",
  balcony: false,
  pets: false,
  status: "",
  religious: "",
};

export default function MapClient({ listings }: { listings: Listing[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const filtered = listings.filter((l) => {
    if (l.price_nis > filter.maxPrice) return false;
    if (filter.rooms) {
      const min = Number(filter.rooms);
      if ((l.rooms ?? 0) < min) return false;
    }
    if (filter.balcony && !l.has_balcony) return false;
    if (filter.pets && !l.pets_allowed) return false;
    if (filter.status && l.roommates_status !== filter.status) return false;
    if (filter.religious && l.roommates_religious_tag !== filter.religious) return false;
    return true;
  });

  // Dynamically load Leaflet only on client
  useEffect(() => {
    if (!mapRef.current) return;

    let map: import("leaflet").Map;

    import("leaflet").then((L) => {
      // Fix default icon path issue in webpack/Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;
      map = L.map(mapRef.current, { zoomControl: false }).setView([32.0, 34.78], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Store map on ref for marker updates
      (mapRef.current as HTMLDivElement & { _leafletMap?: typeof map })._leafletMap = map;
      setMapReady(true);
    });

    return () => {
      map?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add/update markers when filtered changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const mapEl = mapRef.current as HTMLDivElement & { _leafletMap?: import("leaflet").Map; _markers?: import("leaflet").Layer[] };
    const map = mapEl._leafletMap;
    if (!map) return;

    import("leaflet").then((L) => {
      // Remove old markers
      (mapEl._markers ?? []).forEach((m) => map.removeLayer(m));
      mapEl._markers = [];

      filtered.forEach((listing) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#3525cd;color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(53,37,205,0.3)">₪${(listing.price_nis / 1000).toFixed(1)}K</div>`,
          iconAnchor: [20, 10],
        });

        const marker = L.marker([listing.latitude, listing.longitude], { icon }).addTo(map);
        marker.on("click", () => setSelected(listing));
        mapEl._markers!.push(marker);
      });
    });
  }, [filtered, mapReady]);

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Map canvas */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Filter bar */}
      <div className="absolute top-4 inset-x-4 z-10 flex gap-2 flex-wrap items-center bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-[0_4px_20px_-2px_rgba(30,41,59,0.1)]">
        <span className="text-xs font-bold text-on-surface-variant">סינון:</span>

        <select
          value={filter.maxPrice}
          onChange={(e) => setFilter((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className={chip}
        >
          <option value={15000}>כל המחירים</option>
          <option value={3000}>עד ₪3,000</option>
          <option value={4000}>עד ₪4,000</option>
          <option value={5000}>עד ₪5,000</option>
          <option value={7000}>עד ₪7,000</option>
        </select>

        <select
          value={filter.rooms}
          onChange={(e) => setFilter((f) => ({ ...f, rooms: e.target.value }))}
          className={chip}
        >
          <option value="">חדרים</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

        <FilterChip
          label="🏗️ מרפסת"
          active={filter.balcony}
          onClick={() => setFilter((f) => ({ ...f, balcony: !f.balcony }))}
        />
        <FilterChip
          label="🐾 חיות"
          active={filter.pets}
          onClick={() => setFilter((f) => ({ ...f, pets: !f.pets }))}
        />

        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className={chip}
        >
          <option value="">שותפים</option>
          <option value="student">סטודנטים</option>
          <option value="professional">עובדים</option>
          <option value="mixed">מעורב</option>
        </select>

        <select
          value={filter.religious}
          onChange={(e) => setFilter((f) => ({ ...f, religious: e.target.value }))}
          className={chip}
        >
          <option value="">השקפה</option>
          <option value="secular">חילוני</option>
          <option value="traditional">מסורתי</option>
          <option value="religious">דתי</option>
        </select>

        <span className="text-xs text-on-surface-variant mr-auto">
          {filtered.length} דירות
        </span>

        <Link
          href="/listings"
          className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
        >
          ☰ רשימה
        </Link>
      </div>

      {/* Summary card */}
      {selected && (
        <div className="absolute bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:w-80 z-10 bg-white rounded-2xl shadow-[0_10px_30px_-4px_rgba(30,41,59,0.15)] overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-black text-on-surface/20">
              {selected.title.slice(0, 2)}
            </span>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xl font-bold text-on-surface">
                ₪{selected.price_nis.toLocaleString("he-IL")}
                <span className="text-xs font-normal text-on-surface-variant"> /חודש</span>
              </p>
              <button
                onClick={() => setSelected(null)}
                className="text-on-surface-variant hover:text-on-surface text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-1">
              {selected.rooms} חדרים · {selected.size_sqm} מ"ר
            </p>
            {selected.city && (
              <p className="text-xs text-on-surface-variant mb-3">{selected.city}</p>
            )}
            <Link
              href={`/listings/${selected.id}`}
              className="block w-full text-center bg-primary text-on-primary font-bold text-sm py-2.5 rounded-full hover:opacity-90 transition-all"
            >
              לפרטים המלאים →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-primary text-on-primary border-primary"
          : "bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

const chip =
  "text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20";
