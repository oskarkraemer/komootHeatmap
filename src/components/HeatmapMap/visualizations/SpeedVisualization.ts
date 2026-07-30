import { EnrichedRoute } from "@/src/komoot_api/types";
import {
  BaseVisualization,
  type VizMeta,
  type ColorStop,
} from "./BaseVisualization";
import { ZapIcon } from "lucide-react";

export class SpeedVisualization extends BaseVisualization {
  readonly meta: VizMeta = {
    id: "speed",
    label: "Speed",
    description: "Speed of each segment",
    gradientLabels: ["slow", "fast"],
    icon: ZapIcon,
  };

  readonly colorStops: ColorStop[] = [
    { r: 0, g: 53, b: 102 },
    { r: 0, g: 119, b: 182 },
    { r: 0, g: 180, b: 216 },
    { r: 144, g: 224, b: 239 },
  ];

  getValue(route: EnrichedRoute, index: number): number {
    return route.coordinates[index].speed ?? 0;
  }
}
