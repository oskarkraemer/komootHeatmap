import { openDB, DBSchema, IDBPDatabase } from "idb";
import { EnrichedRoute } from "../komoot_api/types";

interface RouteDB extends DBSchema {
  routes: {
    key: string;
    value: {
      tourId: string;
      enrichedRoute: EnrichedRoute;
      cachedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RouteDB>> | null = null;

function getDb(): Promise<IDBPDatabase<RouteDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RouteDB>("komoot-heatmap", 1, {
      upgrade(db) {
        db.createObjectStore("routes", { keyPath: "tourId" });
      },
      blocked() {
        dbPromise = null;
      },
      terminated() {
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

export async function getCachedRoutes(tourIds: string[]) {
  const db = await getDb();
  const all = await Promise.all(tourIds.map((id) => db.get("routes", id)));
  const cached = all.filter(Boolean) as RouteDB["routes"]["value"][];
  const cachedIds = new Set(cached.map((r) => r.tourId));
  const missingIds = tourIds.filter((id) => !cachedIds.has(id));
  return { cached, missingIds };
}

export async function saveRoutes(routes: EnrichedRoute[]) {
  const db = await getDb();
  const tx = db.transaction("routes", "readwrite");
  await Promise.all(
    routes.map((r) =>
      tx.store.put({
        tourId: r.tourId,
        enrichedRoute: r,
        cachedAt: Date.now(),
      }),
    ),
  );
  await tx.done;
}
