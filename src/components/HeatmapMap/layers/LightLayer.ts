import { BaseLayer, type LayerMeta } from "./BaseLayer";

export class LightLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "light",
    label: "Light",
    preview: "#e9ecef",
  };

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    });
  }
}
