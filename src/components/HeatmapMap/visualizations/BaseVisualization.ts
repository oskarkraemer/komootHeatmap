import { EnrichedRoute } from "@/src/komoot_api/types";
import { LucideIcon } from "lucide-react";

export type HotlinePalette = Record<number, string>;

export interface ColorStop {
  r: number;
  g: number;
  b: number;
}

export interface VizMeta {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradientLabels: [string, string];
}

export abstract class BaseVisualization {
  abstract readonly meta: VizMeta;
  abstract readonly colorStops: ColorStop[];

  abstract getValue(route: EnrichedRoute, index: number): number;

  getRouteValue(_route: EnrichedRoute): number | null | undefined {
    return null;
  }

  getOpacity(): number {
    return 0.85;
  }

  // ── Convert colorStops → hotline palette ─────────────────────
  // colorStops are evenly distributed across 0–1
  private getPalette(): HotlinePalette {
    const palette: HotlinePalette = {};
    this.colorStops.forEach((stop, i) => {
      const position = i / (this.colorStops.length - 1);
      palette[position] = `rgba(${stop.r},${stop.g},${stop.b},0.01)`;
    });
    return palette;
  }

  colorStopsToGradient(): string {
    const stops = this.colorStops
      .map((s, i) => {
        const pct = Math.round((i / (this.colorStops.length - 1)) * 100);
        return `rgb(${s.r},${s.g},${s.b}) ${pct}%`;
      })
      .join(", ");
    return `linear-gradient(to right, ${stops})`;
  }

  // ── Compute min/max across all routes ────────────────────────
  computeRange(routes: EnrichedRoute[]): { min: number; max: number } {
    const values: number[] = [];

    for (const route of routes) {
      if (!route || !Array.isArray(route.coordinates)) continue;

      const routeVal = this.getRouteValue(route);
      if (routeVal === undefined) continue;

      if (routeVal !== null) {
        if (isFinite(routeVal)) values.push(routeVal);
        continue;
      }

      for (let i = 0; i < route.coordinates.length; i++) {
        if (!route.coordinates[i]) continue;
        const v = this.getValue(route, i);
        if (isFinite(v)) values.push(v);
      }
    }

    if (values.length === 0) return { min: 0, max: 1 };

    values.sort((a, b) => a - b);

    const [loCut, hiCut] = this.getPercentileCutoff();
    const loIdx = Math.floor(values.length * loCut);
    const hiIdx = Math.ceil(values.length * hiCut) - 1;

    let min = values[loIdx];
    let max = values[Math.min(hiIdx, values.length - 1)];

    if (min === max) {
      const epsilon = 1e-6;
      return { min: min - epsilon, max: max + epsilon };
    }

    return { min, max };
  }

  protected getPercentileCutoff(): [lo: number, hi: number] {
    return [0.0, 0.995];
  }

  // ── Render using hotline — single Canvas draw per route ───────
  render(
    route: EnrichedRoute,
    _map: L.Map,
    layerGroup: L.LayerGroup,
    lineWidth: number,
    range: { min: number; max: number },
  ): void {
    if (
      !route ||
      !Array.isArray(route.coordinates) ||
      route.coordinates.length < 2
    ) {
      return;
    }

    const coords = route.coordinates;
    const routeVal = this.getRouteValue(route);

    // Hotline expects [lat, lng, value] tuples
    const latlngs: [number, number, number][] = coords
      .filter((c) => c != null)
      .map((c, i) => {
        const value = routeVal != null ? routeVal : this.getValue(route, i);
        const clampedValue = isFinite(value) ? value : range.min;
        return [c.lat, c.lng, clampedValue] as [number, number, number];
      });

    if (latlngs.length < 2) return;

    const L = require("leaflet") as typeof import("leaflet");
    const hotlinePlugin = require("leaflet-hotline");
    const factory =
      typeof hotlinePlugin === "function"
        ? hotlinePlugin
        : hotlinePlugin.default;
    if (
      typeof (L as any).hotline !== "function" &&
      typeof factory === "function"
    ) {
      factory(L);
    }

    (L as any)
      .hotline(latlngs, {
        min: range.min,
        max: range.max,
        palette: this.getPalette(),
        weight: lineWidth,
        outlineWidth: 0,
      })
      .addTo(layerGroup);
  }
}
