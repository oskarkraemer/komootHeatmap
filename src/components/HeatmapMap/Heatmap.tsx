"use client";

import { useEffect, useState } from "react";
import { getCachedRoutes, saveRoutes } from "@/src/lib/routeCache";
import { EnrichedRoute } from "@/src/komoot_api/types";
import { BaseVisualization } from "./visualizations/BaseVisualization";
import { HeatmapMap } from ".";
import { BaseLayer } from "./layers/BaseLayer";
import { KomootSportOrAll } from "@/components/app-sidebar";

interface HeatmapProps {
  tourIds: string[];
  visualization: BaseVisualization;
  lineWidth: number;
  mapLayer: BaseLayer;
  activity: KomootSportOrAll;
}

function filterRoutesByActivity(
  routes: EnrichedRoute[],
  activity: KomootSportOrAll,
): EnrichedRoute[] {
  if (activity === "all") return routes;
  return routes.filter((route) => route.sport === activity);
}

export default function Heatmap({
  tourIds,
  visualization,
  lineWidth,
  mapLayer,
  activity,
}: HeatmapProps) {
  const [routes, setRoutes] = useState<EnrichedRoute[]>([]);
  const filteredRoutes = filterRoutesByActivity(routes, activity);

  const [status, setStatus] = useState<"loading" | "syncing" | "ready">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      setStatus("loading");
      setRoutes([]);

      // 1. Check IndexedDB
      const { cached, missingIds } = await getCachedRoutes(tourIds);
      if (cancelled) return;

      // 2. Render cached routes immediately
      setRoutes(cached.map((r) => r.enrichedRoute));
      setStatus(missingIds.length > 0 ? "syncing" : "ready");
      if (missingIds.length === 0) return;

      // 3. Fetch only missing from backend
      let resp: Response;
      try {
        resp = await fetch("/api/routes/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourIds: missingIds }),
        });
      } catch (err) {
        if (!cancelled) setStatus("ready");
        console.error("Failed to fetch missing routes:", err);
        return;
      }

      if (cancelled) return;

      if (!resp.ok) {
        console.error("Batch fetch failed:", resp.status);
        setStatus("ready");
        return;
      }

      const { routes: newRoutes }: { routes: EnrichedRoute[] } =
        await resp.json();
      if (cancelled) return;

      // 4. Save to IndexedDB
      await saveRoutes(newRoutes);
      if (cancelled) return;

      // 5. Add to map
      setRoutes((prev) => [...prev, ...newRoutes]);
      setStatus("ready");
    }

    loadRoutes();

    return () => {
      cancelled = true;
    };
  }, [tourIds]);

  return (
    <div>
      {status === "loading" && <p>Loading routes...</p>}
      {status === "syncing" && <p>Syncing new routes...</p>}
      <HeatmapMap
        routes={filteredRoutes}
        visualization={visualization}
        lineWidth={lineWidth}
        mapLayer={mapLayer}
      />
    </div>
  );
}
