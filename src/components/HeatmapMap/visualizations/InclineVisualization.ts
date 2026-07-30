import { EnrichedRoute } from "@/src/komoot_api/types";
import {
  BaseVisualization,
  type VizMeta,
  type ColorStop,
} from "./BaseVisualization";
import { MountainIcon } from "lucide-react";

export class InclineVisualization extends BaseVisualization {
  readonly meta: VizMeta = {
    id: "incline",
    label: "Incline",
    description: "Steepness of each segment",
    gradientLabels: ["flat", "steep"],
    icon: MountainIcon,
  };

  readonly colorStops: ColorStop[] = [
    { r: 45, g: 198, b: 83 },
    { r: 244, g: 208, b: 63 },
    { r: 255, g: 69, b: 0 },
  ];

  getValue(route: EnrichedRoute, index: number): number {
    return Math.abs(route.coordinates[index].incline ?? 0);
  }
}
