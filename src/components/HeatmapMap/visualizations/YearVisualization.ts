import { EnrichedRoute } from "@/src/komoot_api/types";
import {
  BaseVisualization,
  type VizMeta,
  type ColorStop,
} from "./BaseVisualization";
import { CalendarIcon } from "lucide-react";

export class YearVisualization extends BaseVisualization {
  readonly meta: VizMeta = {
    id: "year",
    label: "Year",
    description: "Routes color-coded by when you rode them.",
    gradientLabels: ["older", "recent"],
    icon: CalendarIcon,
  };

  readonly colorStops: ColorStop[] = [
    { r: 106, g: 5, b: 114 },
    { r: 192, g: 57, b: 43 },
    { r: 230, g: 126, b: 34 },
    { r: 241, g: 196, b: 15 },
  ];

  getValue(_route: EnrichedRoute, _index: number): number {
    return 0;
  }

  getRouteValue(route: EnrichedRoute): number | undefined {
    if (route.year === undefined) {
      console.warn(
        `Route ${route.tourId} has undefined year. This may be due to missing or malformed data.`,
      );
      return undefined;
    }

    return route.year;
  }
}
