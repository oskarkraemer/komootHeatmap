import { NextRequest, NextResponse } from "next/server";
import { fetchAndParseTour } from "@/src/komoot_api/client";
import { getKomootUser } from "@/src/lib/auth/komoot";
import { EnrichedRoute } from "@/src/komoot_api/types";

export type StreamEvent =
  | { type: "started"; progress: number }
  | {
      type: "progress";
      progress: number;
    }
  | { type: "done"; progress: number; results: EnrichedRoute[] }
  | { type: "error"; message: string };

export async function POST(req: NextRequest) {
  const user = await getKomootUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { tourIds }: { tourIds: string[] } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "started", progress: 0 });

        let progress = 0;
        const results: EnrichedRoute[] = (
          await Promise.all(
            tourIds.map(async (id) => {
              const tour = await fetchAndParseTour(id, user.userId, user.token);
              if (tour === null) {
                console.warn(`Tour ${id} returned null, skipping`);
              }

              send({
                type: "progress",
                progress: Math.round((++progress / tourIds.length) * 100),
              });

              return tour;
            }),
          )
        ).filter((r): r is EnrichedRoute => r !== null);

        send({ type: "done", progress: 100, results: results });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
