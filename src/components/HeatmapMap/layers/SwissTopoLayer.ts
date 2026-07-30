import { BaseLayer, type LayerMeta } from "./BaseLayer";

export class SwissTopoMapLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "swisstopo_map",
    label: "SwissTopo",
    preview: "#d4a373",
  };

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    return L.tileLayer(
      "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
      {
        attribution: "© swisstopo",
        maxZoom: 18,
        // SwissTopo tiles only cover Switzerland — outside bounds shows empty
        bounds: L.latLngBounds(
          L.latLng(45.398181, 5.140242),
          L.latLng(47.984716, 10.723492),
        ),
      },
    );
  }
}

export class SwissTopoSatelliteLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "swisstopo_satellite",
    label: "CH Aerial",
    preview: "#2d4a1e",
  };

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    return L.tileLayer(
      "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
      {
        attribution: "© swisstopo",
        maxZoom: 19,
        bounds: L.latLngBounds(
          L.latLng(45.398181, 5.140242),
          L.latLng(47.984716, 10.723492),
        ),
      },
    );
  }
}
