"use client";

import { useState } from "react";
import he from "../../../../messages/he.json";
import { CITY_LABELS_HE, ISRAELI_CITIES } from "@/lib/constants";

type SP = Record<string, string | string[] | undefined>;

function getStr(sp: SP, key: string): string {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}
function getNum(sp: SP, key: string, fallback: number): number {
  const n = Number(getStr(sp, key));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function isOn(sp: SP, key: string): boolean {
  return getStr(sp, key) === "1";
}

const ROOM_OPTS = ["1", "2", "3", "4+"] as const;
const STATUS_OPTS = [
  { v: "student", label: he.filters.status_student },
  { v: "professional", label: he.filters.status_professional },
  { v: "mixed", label: he.filters.status_mixed },
] as const;
const RELIGIOUS_OPTS = [
  { v: "secular", label: he.filters.religious_secular },
  { v: "traditional", label: he.filters.religious_traditional },
  { v: "religious", label: he.filters.religious_religious },
  { v: "mixed", label: he.filters.religious_mixed },
] as const;
const GENDER_OPTS = [
  { v: "male", label: he.filters.gender_male },
  { v: "female", label: he.filters.gender_female },
  { v: "any", label: he.filters.gender_any },
] as const;
const FURNISHED_OPTS = [
  { v: "none", label: he.filters.furnished_none },
  { v: "partial", label: he.filters.furnished_partial },
  { v: "full", label: he.filters.furnished_full },
] as const;
const LEASE_OPTS = [
  { v: "6", label: "6 חודשים" },
  { v: "12", label: "12 חודשים" },
  { v: "24", label: "24 חודשים" },
] as const;

export function FiltersForm({ initial }: { initial: SP }) {
  const [maxPrice, setMaxPrice] = useState(getNum(initial, "max_price", 8000));
  const [maxBus, setMaxBus] = useState(getNum(initial, "max_bus", 1000));
  const [maxTrain, setMaxTrain] = useState(getNum(initial, "max_train", 2000));

  return (
    <form
      method="get"
      action="/listings"
      className="space-y-6 rounded-2xl border border-outline-variant bg-white p-5 text-sm shadow-sm"
    >
      <h2 className="text-base font-bold text-on-surface">{he.filters.title}</h2>

      {/* City */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.city}
        </label>
        <select
          name="city"
          defaultValue={getStr(initial, "city")}
          className={selectCls}
        >
          <option value="">{he.filters.any}</option>
          {ISRAELI_CITIES.map((c) => (
            <option key={c} value={c}>{CITY_LABELS_HE[c] ?? c}</option>
          ))}
        </select>
      </div>

      {/* Price range slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            {he.filters.max_price}
          </label>
          <span className="text-sm font-bold text-primary">
            ₪{maxPrice.toLocaleString("he-IL")}
          </span>
        </div>
        <input
          type="range"
          name="max_price"
          min={1000}
          max={15000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>₪1,000</span>
          <span>₪15,000</span>
        </div>
      </div>

      {/* Rooms chips */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.min_rooms}
        </label>
        <div className="flex gap-2 flex-wrap">
          {ROOM_OPTS.map((r) => {
            const val = r === "4+" ? "4" : r;
            return (
              <ChipRadio
                key={r}
                name="min_rooms"
                value={val}
                label={r}
                defaultChecked={getStr(initial, "min_rooms") === val}
              />
            );
          })}
        </div>
      </div>

      {/* Min sqm */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.min_sqm}
        </label>
        <input
          type="number"
          name="min_sqm"
          inputMode="numeric"
          min={0}
          defaultValue={getStr(initial, "min_sqm")}
          placeholder="מ׳׳ר"
          className={inputCls}
        />
      </div>

      {/* Furnished */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.furnished}
        </label>
        <div className="flex gap-2 flex-wrap">
          {FURNISHED_OPTS.map(({ v, label }) => (
            <ChipRadio
              key={v}
              name="furnished"
              value={v}
              label={label}
              defaultChecked={getStr(initial, "furnished") === v}
            />
          ))}
        </div>
      </div>

      {/* Lease length */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          אורך חוזה
        </label>
        <select name="lease_months" defaultValue={getStr(initial, "lease_months")} className={selectCls}>
          <option value="">{he.filters.any}</option>
          {LEASE_OPTS.map(({ v, label }) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Amenity toggles */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          {he.filters.amenities}
        </legend>
        <Toggle name="has_balcony" label={he.filters.has_balcony} defaultChecked={isOn(initial, "has_balcony")} />
        <Toggle name="pets_allowed" label={he.filters.pets_allowed} defaultChecked={isOn(initial, "pets_allowed")} />
        <Toggle name="smoking_allowed" label={he.filters.smoking_allowed} defaultChecked={isOn(initial, "smoking_allowed")} />
        <Toggle name="parking_available" label={he.filters.parking_available} defaultChecked={isOn(initial, "parking_available")} />
        <Toggle name="air_conditioning" label={he.filters.air_conditioning} defaultChecked={isOn(initial, "air_conditioning")} />
        <Toggle name="accessible" label={he.filters.accessible} defaultChecked={isOn(initial, "accessible")} />
      </fieldset>

      {/* Roommate section */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.roommates_section}
        </legend>

        <div className="space-y-2">
          <span className="text-xs text-on-surface-variant">{he.filters.roommates_status}</span>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTS.map(({ v, label }) => (
              <ChipRadio
                key={v}
                name="roommates_status"
                value={v}
                label={label}
                defaultChecked={getStr(initial, "roommates_status") === v}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-on-surface-variant">{he.filters.religious}</span>
          <div className="flex gap-2 flex-wrap">
            {RELIGIOUS_OPTS.map(({ v, label }) => (
              <ChipRadio
                key={v}
                name="religious"
                value={v}
                label={label}
                defaultChecked={getStr(initial, "religious") === v}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-on-surface-variant">{he.filters.gender_preference}</span>
          <div className="flex gap-2 flex-wrap">
            {GENDER_OPTS.map(({ v, label }) => (
              <ChipRadio
                key={v}
                name="gender"
                value={v}
                label={label}
                defaultChecked={getStr(initial, "gender") === v}
              />
            ))}
          </div>
        </div>
      </fieldset>

      {/* Distance sliders */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {he.filters.distances_section}
        </legend>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-on-surface-variant">{he.filters.max_bus_dist}</span>
            <span className="text-xs font-bold text-primary">{maxBus} מ׳</span>
          </div>
          <input
            type="range"
            name="max_bus"
            min={100}
            max={3000}
            step={100}
            value={maxBus}
            onChange={(e) => setMaxBus(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-on-surface-variant">{he.filters.max_train_dist}</span>
            <span className="text-xs font-bold text-primary">{maxTrain} מ׳</span>
          </div>
          <input
            type="range"
            name="max_train"
            min={100}
            max={5000}
            step={100}
            value={maxTrain}
            onChange={(e) => setMaxTrain(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-primary px-4 py-2.5 font-bold text-on-primary text-sm transition hover:opacity-90"
        >
          {he.filters.apply}
        </button>
        <a
          href="/listings"
          className="rounded-full border border-outline-variant px-4 py-2.5 font-medium text-on-surface-variant text-sm transition hover:border-outline"
        >
          {he.filters.reset}
        </a>
      </div>
    </form>
  );
}

function ChipRadio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <span className="inline-block px-3 py-1 rounded-full border border-outline-variant text-xs font-medium text-on-surface-variant transition peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary hover:border-primary hover:text-primary">
        {label}
      </span>
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          value="1"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors" />
        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:-translate-x-5" />
      </div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-outline-variant bg-white px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm";

const selectCls = inputCls;
