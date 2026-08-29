"use client";

import { useEffect, useState } from "react";
import { getCachedRoutes, saveRoutes } from "@/src/lib/routeCache";
import { EnrichedRoute } from "@/src/komoot_api/types";
import { BaseVisualization } from "./visualizations/BaseVisualization";
import { HeatmapMap } from ".";
import { BaseLayer } from "./layers/BaseLayer";
import { KomootSportOrAll } from "@/components/app-sidebar";
import { StreamEvent } from "@/src/app/api/routes/batch/route";
import { Progress } from "@/components/ui/progress";

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
  const [syncProgress, setSyncProgress] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      setStatus("loading");
      setRoutes([]);
      setSyncProgress(null);

      // 1. Check IndexedDB
      const { cached, missingIds } = await getCachedRoutes(tourIds);
      if (cancelled) return;

      // 2. Render cached routes immediately
      setRoutes(cached.map((r) => r.enrichedRoute));
      setStatus(missingIds.length > 0 ? "syncing" : "ready");
      if (missingIds.length === 0) return;

      // 3. Stream missing routes from backend
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

      if (!resp.ok || !resp.body) {
        console.error("Batch fetch failed:", resp.status);
        setStatus("ready");
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) {
            reader.cancel();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            const event: StreamEvent = JSON.parse(part.slice(6));

            if (event.type === "started") {
              setSyncProgress(null);
            } else if (event.type === "progress") {
              setSyncProgress(event.progress);
            } else if (event.type === "error") {
              console.error("Stream error:", event.message);
            } else if (event.type === "done") {
              if (!cancelled) {
                const routes = event.results;
                setRoutes((prev) => [...prev, ...routes]);
                await saveRoutes(routes);
              }
            }
          }
        }
      } finally {
        if (!cancelled) {
          setSyncProgress(null);
          setStatus("ready");
        }
      }
    }

    loadRoutes();

    return () => {
      cancelled = true;
    };
  }, [tourIds]);

  return (
    <div>
      {status === "loading" && <p>Loading routes...</p>}
      {status === "syncing" && (
        <div>
          <p>
            Syncing new routes...
            {syncProgress && ` ${syncProgress}%`}
          </p>
          <Progress value={syncProgress ? syncProgress : null} />
        </div>
      )}
      <HeatmapMap
        routes={filteredRoutes}
        visualization={visualization}
        lineWidth={lineWidth}
        mapLayer={mapLayer}
      />
    </div>
  );
}
