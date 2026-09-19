"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number | null;
  lng: number | null;
  radius: number;
  onPick: (lat: number, lng: number) => void;
};

/** Click the map to place the site pin. The circle shows the check-in radius. */
export default function MapPicker({ lat, lng, radius, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const lib = useRef<typeof Leaflet | null>(null);
  const pin = useRef<Leaflet.CircleMarker | null>(null);
  const area = useRef<Leaflet.Circle | null>(null);

  // Always read the latest props from inside long-lived Leaflet callbacks.
  const latest = useRef({ lat, lng, radius, onPick });
  latest.current = { lat, lng, radius, onPick };

  const sync = () => {
    const m = map.current;
    const L = lib.current;
    if (!m || !L) return;
    const { lat, lng, radius } = latest.current;
    pin.current?.remove();
    area.current?.remove();
    pin.current = null;
    area.current = null;
    if (lat == null || lng == null) return;

    area.current = L.circle([lat, lng], { radius, color: "#15242C", weight: 2, fillColor: "#FFC800", fillOpacity: 0.25 }).addTo(m);
    pin.current = L.circleMarker([lat, lng], { radius: 7, color: "#15242C", weight: 2, fillColor: "#FFC800", fillOpacity: 1 }).addTo(m);

    if (m.getZoom() < 15) m.setView([lat, lng], 17);
    else if (!m.getBounds().contains([lat, lng])) m.panTo([lat, lng]);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current || map.current) return;
      lib.current = L;
      const start = latest.current;
      const m = L.map(el.current).setView(
        start.lat != null && start.lng != null ? [start.lat, start.lng] : [30, 20],
        start.lat != null ? 17 : 3,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(m);
      m.on("click", (e) => latest.current.onPick(e.latlng.lat, e.latlng.lng));
      map.current = m;
      sync();
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(sync, [lat, lng, radius]);

  return <div ref={el} className="isolate h-80 w-full rounded border border-line md:h-96" role="application" aria-label="Map: click to place the site pin" />;
}
