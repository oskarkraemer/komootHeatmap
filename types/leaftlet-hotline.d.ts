import * as L from "leaflet";

declare module "leaflet" {
  interface HotlineOptions {
    min?: number;
    max?: number;
    palette?: Record<number, string>;
    weight?: number;
    outlineWidth?: number;
    outlineColor?: string;
    opacity?: number;
  }

  class Hotline extends L.Polyline {
    constructor(latlngs: [number, number, number][], options?: HotlineOptions);
  }

  function hotline(
    latlngs: [number, number, number][],
    options?: HotlineOptions,
  ): Hotline;
}
