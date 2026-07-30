import { BaseLayer, type LayerMeta } from "./BaseLayer";

export class SatelliteLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "satellite",
    label: "Satellite",
    preview: "#1b4332",
  };

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    return L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri — Source: Esri, USGS, NOAA",
        maxZoom: 19,
      },
    );
  }
}
