"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EnrichedRoute } from "@/src/komoot_api/types";
import { BaseVisualization } from "./visualizations/BaseVisualization";
import { BaseLayer } from "./layers/BaseLayer";
import GpsLocationPlugin from "./plugins/GpsLocationPlugin";
import RouteInfoPlugin from "./plugins/RouteInfoPlugin";

interface HeatmapMapProps {
  routes: EnrichedRoute[];
  visualization: BaseVisualization;
  lineWidth: number;
  mapLayer: BaseLayer;
}

function renderBatch(
  routes: EnrichedRoute[],
  layerGroup: L.LayerGroup,
  visualization: BaseVisualization,
  lineWidth: number,
  range: { min: number; max: number },
  map: L.Map,
  cancelled: { current: boolean },
  batchSize = 50,
  index = 0,
) {
  if (cancelled.current) return;
  if (index >= routes.length) return;

  routes.slice(index, index + batchSize).forEach((route) => {
    visualization.render(route, map, layerGroup, lineWidth, range);
  });

  requestAnimationFrame(() =>
    renderBatch(
      routes,
      layerGroup,
      visualization,
      lineWidth,
      range,
      map,
      cancelled,
      batchSize,
      index + batchSize,
    ),
  );
}

export default function HeatmapMap({
  routes,
  visualization,
  lineWidth,
  mapLayer,
}: HeatmapMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const batchCancelRef = useRef<{ current: boolean }>({ current: false });
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const renderRoutes = useCallback(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    batchCancelRef.current.current = true;
    const cancelled = { current: false };
    batchCancelRef.current = cancelled;

    layerGroup.clearLayers();

    if (routes.length === 0) return;

    const range = visualization.computeRange(routes);

    renderBatch(
      routes,
      layerGroup,
      visualization,
      lineWidth,
      range,
      map,
      cancelled,
    );
  }, [routes, visualization, lineWidth]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [51.505, 10.09],
      zoom: 6,
      renderer: L.canvas(),
      preferCanvas: true,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapInstance(map);
    return () => {
      batchCancelRef.current.current = true;
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileLayerRef.current?.remove();
    tileLayerRef.current = mapLayer.createTileLayer().addTo(map);
  }, [mapLayer]);

  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full z-10">
        <div className="absolute top-20 right-2.5 z-1000">
          <GpsLocationPlugin map={mapInstance} />
        </div>
      </div>

      {/* <RouteInfoPlugin map={mapInstance} routes={routes} /> */}
    </div>
  );
}
