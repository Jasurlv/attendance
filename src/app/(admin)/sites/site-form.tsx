"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Field } from "@/components/field";
import type { ActionState } from "@/lib/action-state";
import { useServerForm } from "@/lib/use-server-form";

// Leaflet touches `window`, so the map only loads in the browser.
const MapPicker = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded bg-line/50 md:h-96" />,
});

export type SiteDefaults = {
  name: string;
  latitude: string;
  longitude: string;
  radiusM: string;
  timezone: string;
  startTime: string;
  lunchFrom: string;
  lunchTo: string;
  endTime: string;
  graceMinutes: string;
};

export const emptySite: SiteDefaults = {
  name: "",
  latitude: "",
  longitude: "",
  radiusM: "50",
  timezone: "Europe/Riga",
  startTime: "08:00",
  lunchFrom: "12:00",
  lunchTo: "13:00",
  endTime: "18:00",
  graceMinutes: "0",
};

const toNum = (s: string) => (s.trim() !== "" && Number.isFinite(Number(s)) ? Number(s) : null);

export function SiteForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: SiteDefaults;
  submitLabel: string;
}) {
  const { state, pending, onSubmit } = useServerForm(action);
  const fe = state.fieldErrors ?? {};

  const [lat, setLat] = useState(defaults.latitude);
  const [lng, setLng] = useState(defaults.longitude);
  const [radius, setRadius] = useState(defaults.radiusM);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const setPoint = (la: number, ln: number) => {
    setLat(la.toFixed(6));
    setLng(ln.toFixed(6));
  };

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setLocationNote("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      );
      const data: { lat: string; lon: string }[] = await res.json();
      if (!data[0]) setLocationNote("No place found. Try another address, or click the map to place the pin.");
      else setPoint(Number(data[0].lat), Number(data[0].lon));
    } catch {
      setLocationNote("Address search is unavailable. Click the map to place the pin.");
    } finally {
      setSearching(false);
    }
  }

  function useMyLocation() {
    setLocationNote("");
    if (!navigator.geolocation) {
      setLocationNote("This browser cannot share its location. Click the map instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPoint(p.coords.latitude, p.coords.longitude),
      () => setLocationNote("Location was blocked. Allow it in the browser, or click the map."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-2xl">Details</h2>
          <Field id="name" label="Site name" error={fe.name}>
            <input id="name" name="name" defaultValue={defaults.name} className="input" placeholder="Building 3, Central Street" required />
          </Field>
          <Field
            id="timezone"
            label="Timezone"
            error={fe.timezone}
            hint="Start and end times below are read in this timezone."
          >
            <input id="timezone" name="timezone" defaultValue={defaults.timezone} className="input" list="timezones" />
            <datalist id="timezones">
              {(typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []).map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </Field>

          <h2 className="pt-2 text-2xl">Work hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field id="startTime" label="Work starts" error={fe.startTime}>
              <input id="startTime" name="startTime" type="time" defaultValue={defaults.startTime} className="input" />
            </Field>
            <Field id="endTime" label="Work ends" error={fe.endTime}>
              <input id="endTime" name="endTime" type="time" defaultValue={defaults.endTime} className="input" />
            </Field>
            <Field id="lunchFrom" label="Lunch starts" error={fe.lunchFrom}>
              <input id="lunchFrom" name="lunchFrom" type="time" defaultValue={defaults.lunchFrom} className="input" />
            </Field>
            <Field id="lunchTo" label="Lunch ends" error={fe.lunchTo}>
              <input id="lunchTo" name="lunchTo" type="time" defaultValue={defaults.lunchTo} className="input" />
            </Field>
          </div>
          <Field
            id="graceMinutes"
            label="Grace period (minutes)"
            error={fe.graceMinutes}
            hint="A worker who starts within this many minutes after the start time is not counted late."
          >
            <input id="graceMinutes" name="graceMinutes" type="number" min={0} max={60} defaultValue={defaults.graceMinutes} className="input" />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Location</h2>
          <div>
            <label htmlFor="search" className="label">
              Find an address
            </label>
            <div className="flex gap-2">
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    search();
                  }
                }}
                className="input"
                placeholder="Street, city"
              />
              <button type="button" onClick={search} disabled={searching} className="btn-secondary shrink-0">
                {searching ? "Searching…" : "Search"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <button type="button" onClick={useMyLocation} className="text-sm font-medium underline underline-offset-4">
                Use my current location
              </button>
              {locationNote && <p role="status" className="text-sm text-steel">{locationNote}</p>}
            </div>
          </div>

          <MapPicker lat={toNum(lat)} lng={toNum(lng)} radius={toNum(radius) ?? 50} onPick={setPoint} />

          <div className="grid grid-cols-2 gap-4">
            <Field id="latitude" label="Latitude" error={fe.latitude}>
              <input id="latitude" name="latitude" value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" className="input" />
            </Field>
            <Field id="longitude" label="Longitude" error={fe.longitude}>
              <input id="longitude" name="longitude" value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" className="input" />
            </Field>
          </div>
          <Field
            id="radiusM"
            label="Check-in radius (metres)"
            error={fe.radiusM}
            hint="Workers must be this close to the pin to check in. Under 30 m, GPS drift can reject honest workers."
          >
            <input id="radiusM" name="radiusM" type="number" min={10} max={1000} value={radius} onChange={(e) => setRadius(e.target.value)} className="input" />
          </Field>
        </section>
      </div>

      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/sites" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
