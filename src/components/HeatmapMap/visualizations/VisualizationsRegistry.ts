"use client";

import { HeatmapVisualization } from "./HeatmapVisualization";
import { SpeedVisualization } from "./SpeedVisualization";
import { InclineVisualization } from "./InclineVisualization";
import { YearVisualization } from "./YearVisualization";
import { ElapsedTimeVisualization } from "./ElapsedTimeVisualization";
import type { BaseVisualization } from "./BaseVisualization";

export const VISUALIZATIONS: BaseVisualization[] = [
  new HeatmapVisualization(),
  new SpeedVisualization(),
  new InclineVisualization(),
  new YearVisualization(),
  new ElapsedTimeVisualization(),
];
