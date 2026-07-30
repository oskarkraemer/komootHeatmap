"use client";

import { AppSidebar, KomootSportOrAll } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { BaseVisualization } from "./visualizations/BaseVisualization";
import { HeatmapVisualization } from "./visualizations/HeatmapVisualization";
import Heatmap from "./Heatmap";
import { BaseLayer } from "./layers/BaseLayer";
import { DarkLayer } from "./layers/DarkLayer";
import { useKomootUser } from "@/src/contexts/KomootUserContext";
import BuyMeACoffeePopup from "../Landing/BuyMeACoffePopup";

export function HeatmapPage({ tourIds }: { tourIds: string[] }) {
  const { user, logout } = useKomootUser();

  const [visualization, setVisualization] = useState<BaseVisualization>(
    new HeatmapVisualization(),
  );
  const [lineWidth, setLineWidth] = useState<number>(1.5);
  const [mapLayer, setMapLayer] = useState<BaseLayer>(new DarkLayer());
  const [activity, setActivity] = useState<KomootSportOrAll>("all");

  return (
    <SidebarProvider>
      <AppSidebar
        visualization={visualization}
        setVisualization={setVisualization}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        activity={activity}
        setActivity={setActivity}
        user={user}
        onLogoutClicked={logout}
      />

      <SidebarInset>
        <SidebarTrigger
          className="absolute left-5 top-3 z-50 md:hidden"
          style={{ color: "#ff4500" }}
        />
        <Heatmap
          tourIds={tourIds}
          visualization={visualization}
          lineWidth={lineWidth}
          mapLayer={mapLayer}
          activity={activity}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
