import { EnrichedRoute } from "@/src/komoot_api/types";
import {
  BaseVisualization,
  type VizMeta,
  type ColorStop,
} from "./BaseVisualization";
import { TimerIcon } from "lucide-react";

export class ElapsedTimeVisualization extends BaseVisualization {
  readonly meta: VizMeta = {
    id: "elapsed_time",
    label: "Elapsed time",
    description: "How long each route took from start to finish.",
    gradientLabels: ["short", "long"],
    icon: TimerIcon,
  };

  readonly colorStops: ColorStop[] = [
    { r: 2, g: 62, b: 138 },
    { r: 72, g: 202, b: 228 },
    { r: 173, g: 232, b: 244 },
  ];

  getValue(_route: EnrichedRoute, _index: number): number {
    return 0;
  }

  getRouteValue(route: EnrichedRoute): number | undefined {
    return route.totalDuration;
  }
}
