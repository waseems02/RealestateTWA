import he from "../../../../messages/he.json";
import { CITY_LABELS_HE, ISRAELI_CITIES } from "@/lib/constants";

type SP = Record<string, string | string[] | undefined>;

function getStr(sp: SP, key: string): string {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function isOn(sp: SP, key: string): boolean {
  return getStr(sp, key) === "1";
}

export function FiltersForm({ initial }: { initial: SP }) {
  return (
    <form
      method="get"
      action="/listings"
      className="space-y-6 rounded-lg border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {he.filters.title}
      </h2>

      <Field label={he.filters.city}>
        <select
          name="city"
          defaultValue={getStr(initial, "city")}
          className={selectCls}
        >
          <option value="">{he.filters.any}</option>
          {ISRAELI_CITIES.map((c) => (
            <option key={c} value={c}>
              {CITY_LABELS_HE[c] ?? c}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={he.filters.min_price}>
          <input
            type="number"
            name="min_price"
            inputMode="numeric"
            min={0}
            defaultValue={getStr(initial, "min_price")}
            className={inputCls}
          />
        </Field>
        <Field label={he.filters.max_price}>
          <input
            type="number"
            name="max_price"
            inputMode="numeric"
            min={0}
            defaultValue={getStr(initial, "max_price")}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={he.filters.min_rooms}>
          <input
            type="number"
            name="min_rooms"
            inputMode="decimal"
            min={0}
            step={0.5}
            defaultValue={getStr(initial, "min_rooms")}
            className={inputCls}
          />
        </Field>
        <Field label={he.filters.min_sqm}>
          <input
            type="number"
            name="min_sqm"
            inputMode="numeric"
            min={0}
            defaultValue={getStr(initial, "min_sqm")}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={he.filters.furnished}>
        <select
          name="furnished"
          defaultValue={getStr(initial, "furnished")}
          className={selectCls}
        >
          <option value="">{he.filters.any}</option>
          <option value="none">{he.filters.furnished_none}</option>
          <option value="partial">{he.filters.furnished_partial}</option>
          <option value="full">{he.filters.furnished_full}</option>
        </select>
      </Field>

      <fieldset className="space-y-2">
        <legend className="font-medium text-zinc-900 dark:text-zinc-50">
          {he.filters.amenities}
        </legend>
        <CheckRow name="has_balcony" label={he.filters.has_balcony} checked={isOn(initial, "has_balcony")} />
        <CheckRow name="parking_available" label={he.filters.parking_available} checked={isOn(initial, "parking_available")} />
        <CheckRow name="air_conditioning" label={he.filters.air_conditioning} checked={isOn(initial, "air_conditioning")} />
        <CheckRow name="accessible" label={he.filters.accessible} checked={isOn(initial, "accessible")} />
        <CheckRow name="pets_allowed" label={he.filters.pets_allowed} checked={isOn(initial, "pets_allowed")} />
        <CheckRow name="smoking_allowed" label={he.filters.smoking_allowed} checked={isOn(initial, "smoking_allowed")} />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-medium text-zinc-900 dark:text-zinc-50">
          {he.filters.roommates_section}
        </legend>

        <Field label={he.filters.roommates_status}>
          <select
            name="roommates_status"
            defaultValue={getStr(initial, "roommates_status")}
            className={selectCls}
          >
            <option value="">{he.filters.any}</option>
            <option value="student">{he.filters.status_student}</option>
            <option value="professional">{he.filters.status_professional}</option>
            <option value="mixed">{he.filters.status_mixed}</option>
          </select>
        </Field>

        <Field label={he.filters.religious}>
          <select
            name="religious"
            defaultValue={getStr(initial, "religious")}
            className={selectCls}
          >
            <option value="">{he.filters.any}</option>
            <option value="secular">{he.filters.religious_secular}</option>
            <option value="traditional">{he.filters.religious_traditional}</option>
            <option value="religious">{he.filters.religious_religious}</option>
            <option value="mixed">{he.filters.religious_mixed}</option>
          </select>
        </Field>

        <Field label={he.filters.gender_preference}>
          <select
            name="gender"
            defaultValue={getStr(initial, "gender")}
            className={selectCls}
          >
            <option value="">{he.filters.gender_any}</option>
            <option value="male">{he.filters.gender_male}</option>
            <option value="female">{he.filters.gender_female}</option>
          </select>
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-medium text-zinc-900 dark:text-zinc-50">
          {he.filters.distances_section}
        </legend>
        <Field label={he.filters.max_bus_dist}>
          <input
            type="number"
            name="max_bus"
            inputMode="numeric"
            min={0}
            defaultValue={getStr(initial, "max_bus")}
            className={inputCls}
          />
        </Field>
        <Field label={he.filters.max_train_dist}>
          <input
            type="number"
            name="max_train"
            inputMode="numeric"
            min={0}
            defaultValue={getStr(initial, "max_train")}
            className={inputCls}
          />
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {he.filters.apply}
        </button>
        <a
          href="/listings"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
        >
          {he.filters.reset}
        </a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function CheckRow({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={checked}
        className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
      />
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const selectCls = inputCls;
