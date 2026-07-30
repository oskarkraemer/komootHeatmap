export interface LayerMeta {
  id: string;
  label: string;
  preview: string;
}

export abstract class BaseLayer {
  abstract readonly meta: LayerMeta;
  abstract createTileLayer(): import("leaflet").TileLayer;
}
