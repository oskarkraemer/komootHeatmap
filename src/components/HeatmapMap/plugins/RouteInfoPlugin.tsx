"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { MapPluginProps } from "./types";
import type { EnrichedRoute } from "@/src/komoot_api/types";

interface RouteInfoPluginProps extends MapPluginProps {
  routes: EnrichedRoute[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

export default function RouteInfoPlugin({ map, routes }: RouteInfoPluginProps) {
  const [selected, setSelected] = useState<EnrichedRoute | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!map || routes.length === 0) return;

    // Place an invisible hit target at each route's start point
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    routes.forEach((route) => {
      const first = route.coordinates[0];
      if (!first) return;

      const marker = L.circleMarker([first.lat, first.lng], {
        radius: 6,
        color: "transparent",
        fillColor: "transparent",
        fillOpacity: 0,
        interactive: true,
      }).addTo(map);

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        console.log("Route clicked:", route);
        setSelected(route);
      });

      markersRef.current.push(marker);
    });

    map.on("click", () => setSelected(null));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.off("click");
    };
  }, [map, routes]);

  if (!selected) return null;

  console.log("Selected route:", selected);

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-1000 w-72
      bg-[#1a1a2e]/95 border border-[#2a3545] rounded-xl p-4
      backdrop-blur-sm text-white"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-sm font-semibold leading-tight truncate">
          {selected.tourId}
        </div>
        <button
          onClick={() => setSelected(null)}
          className="text-white/40 hover:text-white/80 shrink-0 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Sport", value: selected.sport ?? "—" },
          { label: "Year", value: String(selected.year) },
          {
            label: "Duration",
            value: selected.totalDuration
              ? formatDuration(selected.totalDuration)
              : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
              {label}
            </div>
            <div className="text-sm font-medium capitalize">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
