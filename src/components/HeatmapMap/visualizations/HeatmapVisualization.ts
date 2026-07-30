import { EnrichedRoute } from "@/src/komoot_api/types";
import {
  BaseVisualization,
  type VizMeta,
  type ColorStop,
} from "./BaseVisualization";
import { FlameIcon } from "lucide-react";

export class HeatmapVisualization extends BaseVisualization {
  readonly meta: VizMeta = {
    id: "heatmap",
    label: "Heatmap",
    description: "Brighter where you ride most often",
    gradientLabels: ["rarely", "often"],
    icon: FlameIcon,
  };

  readonly colorStops: ColorStop[] = [
    { r: 255, g: 69, b: 0 },
    { r: 255, g: 69, b: 0 },
  ];

  getValue(_route: EnrichedRoute, _index: number): number {
    return 0.5;
  }

  getOpacity(): number {
    return 0.55;
  }

  // Override render for heatmap visualization to use opacity and a single polyline
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
    require("leaflet-hotline");

    L.polyline(latlngs, {
      color: "#ff4500",
      weight: lineWidth,
      opacity: this.getOpacity(),
    }).addTo(layerGroup);
  }
}
