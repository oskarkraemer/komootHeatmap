import { BaseLayer, type LayerMeta } from "./BaseLayer";

export class DarkLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "dark",
    label: "Dark",
    preview: "#1a1a2e",
  };

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    return L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      },
    );
  }
}
