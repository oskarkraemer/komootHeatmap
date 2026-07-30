import { HeatmapPage } from "@/src/components/HeatmapMap/HeatmapPage";
import { getUserTours } from "@/src/komoot_api/client";
import { KomootTourType } from "@/src/komoot_api/types";
import { requireKomootUser } from "@/src/lib/auth/komoot";

export default async function HeatmapIndex() {
  const user = await requireKomootUser();

  const result = await getUserTours(user.userId, user.token, {
    tourType: [KomootTourType.RECORDED],
    //sport: [KomootSport.ROAD_CYCLING],
    //tourOwner: [KomootTourOwner.SELF],
  });

  const tourIds = result.tours?.map((tour) => tour.id.toString()) || [];

  return <HeatmapPage tourIds={tourIds} />;
}
