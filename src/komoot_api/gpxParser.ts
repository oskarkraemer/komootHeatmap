import { gpx } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import { EnrichedCoordinate, EnrichedRoute, KomootSport } from "./types";
import simplify from "@turf/simplify";
import { lineString } from "@turf/helpers";

function haversineDistance(
  a: EnrichedCoordinate,
  b: EnrichedCoordinate,
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function gpxToEnrichedGeoJson(
  gpxString: string,
  tourId: string,
): EnrichedRoute {
  const dom = new DOMParser().parseFromString(gpxString, "text/xml");
  const trkpts = dom.getElementsByTagName("trkpt");
  const coordinates: EnrichedCoordinate[] = [];

  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    coordinates.push({
      lat: parseFloat(pt.getAttribute("lat")!),
      lng: parseFloat(pt.getAttribute("lon")!),
      alt: parseFloat(pt.getElementsByTagName("ele")[0]?.textContent ?? "0"),
      timestamp:
        new Date(
          pt.getElementsByTagName("time")[0]?.textContent ?? "",
        ).getTime() || undefined,
    });
  }

  // Enrich with speed + incline before simplification
  // (we need distances computed on the full-resolution track)
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const dist = haversineDistance(prev, curr);
    const elevDiff = curr.alt - prev.alt;
    const timeDiff =
      curr.timestamp && prev.timestamp
        ? (curr.timestamp - prev.timestamp) / 1000
        : null;
    curr.speed = timeDiff && timeDiff > 0 ? dist / timeDiff : 0;
    curr.incline = dist > 0 ? (elevDiff / dist) * 100 : 0;
  }
  coordinates[0].speed = coordinates[1]?.speed ?? 0;
  coordinates[0].incline = coordinates[1]?.incline ?? 0;

  // Build a lookup key from lat/lng so we can recover enriched data
  // after simplification drops points
  const coordMap = new Map<string, EnrichedCoordinate>();
  for (const c of coordinates) {
    coordMap.set(`${c.lat},${c.lng}`, c);
  }

  // Simplify the geometry — turf expects [lng, lat] (GeoJSON axis order)
  const line = lineString(coordinates.map((c) => [c.lng, c.lat, c.alt]));
  const simplified = simplify(line, {
    tolerance: 0.00005,
    mutate: false, // don't mutate — we still need coordMap intact
    highQuality: true,
  });

  // Map simplified coordinates back to EnrichedCoordinate using the lookup
  const simplifiedCoords: EnrichedCoordinate[] = simplified.geometry.coordinates
    .map(([lng, lat]) => coordMap.get(`${lat},${lng}`))
    .filter((c): c is EnrichedCoordinate => c !== undefined);

  const first = simplifiedCoords[0]?.timestamp ?? undefined;
  const last =
    simplifiedCoords[simplifiedCoords.length - 1]?.timestamp ?? undefined;

  // Extract activity type from GPX metadata if available
  const sport = dom
    .getElementsByTagName("trk")[0]
    ?.getElementsByTagName("type")[0]?.textContent as KomootSport | undefined;

  return {
    tourId,
    year: first ? new Date(first).getFullYear() : undefined,
    totalDuration: last && first ? (last - first) / 1000 : undefined,
    coordinates: simplifiedCoords,
    sport: sport ?? KomootSport.OTHER,
  };
}
