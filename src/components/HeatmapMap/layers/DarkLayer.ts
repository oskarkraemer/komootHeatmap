import { BaseLayer, type LayerMeta } from "./BaseLayer";

export class DarkLayer extends BaseLayer {
  readonly meta: LayerMeta = {
    id: "dark",
    label: "Dark",
    preview: "#1a1a2e",
  };

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .dark-tiles {
        filter: invert(100%) hue-rotate(180deg) brightness(45%) contrast(90%);
      }
    `;
    document.head.appendChild(style);
  }

  createTileLayer() {
    const L = require("leaflet") as typeof import("leaflet");
    this.addStyles();
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
      className: "dark-tiles",
    });
  }
}
