import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchAndParseTour } from "@/src/komoot_api/client";
import { getKomootUser } from "@/src/lib/auth/komoot";
import { EnrichedRoute } from "@/src/komoot_api/types";

export async function POST(req: NextRequest) {
  const user = await getKomootUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { tourIds }: { tourIds: string[] } = await req.json();

  const results: EnrichedRoute[] = (
    await Promise.all(
      tourIds.map(async (id) => {
        const tour = await fetchAndParseTour(id, user.userId, user.token);
        if (tour === null) {
          console.warn(`Tour ${id} returned null, skipping`);
        }
        return tour;
      }),
    )
  ).filter((r): r is EnrichedRoute => r !== null);

  return NextResponse.json({ routes: results });
}
