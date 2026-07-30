"use client";

import { DarkLayer } from "./DarkLayer";
import type { BaseLayer } from "./BaseLayer";
import { LightLayer } from "./LightLayer";
import { SatelliteLayer } from "./SatelliteLayer";
import { SwissTopoMapLayer, SwissTopoSatelliteLayer } from "./SwissTopoLayer";

export const MAP_LAYERS: BaseLayer[] = [
  new DarkLayer(),
  new LightLayer(),
  new SatelliteLayer(),
  new SwissTopoMapLayer(),
  new SwissTopoSatelliteLayer(),
];
