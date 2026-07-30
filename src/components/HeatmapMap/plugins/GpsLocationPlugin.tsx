"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import L from "leaflet";
import type { MapPluginProps } from "./types";
import { CrosshairIcon, LoaderIcon, XIcon } from "lucide-react";

type GpsState = "idle" | "locating" | "active" | "error";

function createLocationMarker(latlng: L.LatLngExpression): L.Marker {
  const icon = L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(72,202,228,0.25);animation:gpsPulse 2s ease-out infinite;"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#48cae4;border:2px solid #fff;position:relative;z-index:1;"></div>
      </div>
    `,
  });
  return L.marker(latlng, { icon, zIndexOffset: 1000 });
}

export default function GpsLocationPlugin({ map }: MapPluginProps) {
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (document.getElementById("gps-pulse-style")) return;
    const style = document.createElement("style");
    style.id = "gps-pulse-style";
    style.textContent = `@keyframes gpsPulse {
      0%   { transform:scale(1);   opacity:0.8; }
      100% { transform:scale(2.8); opacity:0; }
    }`;
    document.head.appendChild(style);
  }, []);

  useEffect(
    () => () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      markerRef.current?.remove();
    },
    [],
  );

  function handleClick() {
    if (!map) return;

    if (gpsState === "active") {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      setGpsState("idle");
      return;
    }

    if (!navigator.geolocation) {
      setGpsState("error");
      return;
    }
    posthog.capture("heatmap_location_requested");
    setGpsState("locating");

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setGpsState("active");
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = createLocationMarker([lat, lng]).addTo(map);
          map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 1.2 });
        }
      },
      () => {
        setGpsState("error");
        setTimeout(() => setGpsState("idle"), 3000);
      },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }

  const styles: Record<GpsState, string> = {
    idle: "bg-background border-border text-white hover:bg-background/50 hover:border-border/50 transition-colors",
    locating: "bg-background border-border text-[#48cae4] animate-pulse",
    active: "bg-[#48cae4] border-[#48cae4] text-[#080b10]",
    error: "bg-background border-red-500/50 text-red-400",
  };

  const titles: Record<GpsState, string> = {
    idle: "Show my location",
    locating: "Finding location…",
    active: "Hide my location",
    error: "Location unavailable",
  };

  return (
    <button
      onClick={handleClick}
      title={titles[gpsState]}
      className={`map-plugin-btn ${styles[gpsState]}`}
    >
      {gpsState === "locating" ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : gpsState === "error" ? (
        <XIcon className="w-4 h-4" />
      ) : (
        <CrosshairIcon className="w-4 h-4" />
      )}
    </button>
  );
}
