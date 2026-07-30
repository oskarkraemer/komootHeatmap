"use client";
import * as React from "react";
import posthog, { DisplaySurveyType } from "posthog-js";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  FlameIcon,
  MapIcon,
  BikeIcon,
  FootprintsIcon,
  PersonStandingIcon,
  CoffeeIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  ActivityIcon,
  MountainIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { BaseVisualization } from "@/src/components/HeatmapMap/visualizations/BaseVisualization";
import { VISUALIZATIONS } from "@/src/components/HeatmapMap/visualizations/VisualizationsRegistry";
import { BaseLayer } from "@/src/components/HeatmapMap/layers/BaseLayer";
import { MAP_LAYERS } from "@/src/components/HeatmapMap/layers/LayersRegistry";
import { KomootSport, KomootUserDetails } from "@/src/komoot_api/types";
import { HeatmapIcon } from "@/src/lib/icons";
import GithubStarsBadge from "@/src/components/Landing/GithubStarsBadge";

export type KomootSportOrAll = KomootSport | "all";

const ACTIVITIES: {
  id: KomootSportOrAll;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "all", label: "All", icon: <ActivityIcon size={13} /> },
  { id: KomootSport.BIKE_TOURING, label: "Bike", icon: <BikeIcon size={13} /> },
  {
    id: KomootSport.GRAVEL_BIKING,
    label: "Gravel",
    icon: <BikeIcon size={13} />,
  },
  { id: KomootSport.ROAD_CYCLING, label: "Road", icon: <BikeIcon size={13} /> },
  { id: KomootSport.MT_BIKING, label: "MTB", icon: <MountainIcon size={13} /> },
  { id: KomootSport.HIKING, label: "Hike", icon: <FootprintsIcon size={13} /> },
  {
    id: KomootSport.RUNNING,
    label: "Run",
    icon: <PersonStandingIcon size={13} />,
  },
  {
    id: KomootSport.MOUNTAINEERING,
    label: "Mountain",
    icon: <MountainIcon size={13} />,
  },
  {
    id: KomootSport.ROCK_CLIMBING,
    label: "Climbing",
    icon: <MountainIcon size={13} />,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  visualization: BaseVisualization;
  setVisualization: (viz: BaseVisualization) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  mapLayer: BaseLayer;
  setMapLayer: (layer: BaseLayer) => void;
  activity: KomootSportOrAll;
  setActivity: (activity: KomootSportOrAll) => void;
  user: KomootUserDetails | null;
  onLogoutClicked(): void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        opacity: 0.45,
        padding: "10px 12px 4px",
        color: "var(--sidebar-foreground)",
      }}
    >
      {children}
    </div>
  );
}

function GradientLegend({ viz }: { viz: BaseVisualization }) {
  return (
    <div className="px-3 pb-1">
      <div
        style={{
          background: viz.colorStopsToGradient(),
          height: 8,
          borderRadius: 4,
        }}
        className="w-full mb-1"
      />
      <div className="flex justify-between">
        <span
          style={{
            fontSize: 10,
            color: "var(--sidebar-foreground)",
            opacity: 0.5,
          }}
        >
          {viz.meta.gradientLabels[0]}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--sidebar-foreground)",
            opacity: 0.5,
          }}
        >
          {viz.meta.gradientLabels[1]}
        </span>
      </div>
    </div>
  );
}

export function AppSidebar({
  visualization,
  setVisualization,
  lineWidth,
  setLineWidth,
  mapLayer,
  setMapLayer,
  activity,
  setActivity,
  user,
  onLogoutClicked,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Header ── */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-3 py-3">
          <HeatmapIcon className="w-5 h-5" />
          <span className="font-bold text-[15px] tracking-[-0.02em]">
            komoot heatmap
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent style={{ overflowY: "auto" }}>
        {/* ── Visualization Switch — driven by VISUALIZATIONS registry ── */}
        <SidebarGroup>
          <SectionLabel>
            <span className="flex items-center gap-1">
              <FlameIcon size={10} /> Visualization
            </span>
          </SectionLabel>

          <div className="px-2 flex flex-col gap-1 pb-2">
            {VISUALIZATIONS.map((viz: BaseVisualization) => {
              const isActive = viz.meta.id === visualization.meta.id;
              const VizIcon = viz.meta.icon;
              return (
                <button
                  key={viz.meta.id}
                  onClick={() => {
                    setVisualization(viz);
                    posthog.capture("heatmap_visualization_selected", {
                      visualization: viz.meta.id,
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: isActive
                      ? "var(--sidebar-accent)"
                      : "transparent",
                    color: "var(--sidebar-foreground)",
                    transition: "background 0.15s",
                    width: "100%",
                  }}
                >
                  {/* Icon comes from VizMeta */}
                  <span style={{ marginTop: 2, opacity: isActive ? 1 : 0.5 }}>
                    <VizIcon size={16} />
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}
                    >
                      {viz.meta.label}
                    </div>
                    <div
                      style={{ fontSize: 11, opacity: 0.5, lineHeight: 1.4 }}
                    >
                      {viz.meta.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Legend — derived from active viz's colorStops ── */}
        <SidebarGroup>
          <SectionLabel>Legend — {visualization.meta.label}</SectionLabel>
          <GradientLegend viz={visualization} />
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Line Width ── */}
        <SidebarGroup>
          <SectionLabel>
            <span className="flex items-center gap-1">
              <SlidersHorizontalIcon size={10} /> Line width — {lineWidth}px
            </span>
          </SectionLabel>
          <div className="px-3 pb-3">
            <input
              type="range"
              min={1}
              max={6}
              step={0.5}
              value={lineWidth}
              onChange={(e) => {
                const width = Number(e.target.value);
                setLineWidth(width);
                posthog.capture("heatmap_line_width_changed", {
                  line_width: width,
                });
              }}
              className="w-full accent-primary"
            />
            <div
              className="flex justify-between"
              style={{ fontSize: 10, opacity: 0.4 }}
            >
              <span>thin</span>
              <span>thick</span>
            </div>
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Map Layer ── */}
        <SidebarGroup>
          <SectionLabel>
            <span className="flex items-center gap-1">
              <LayersIcon size={10} /> Map layer
            </span>
          </SectionLabel>
          <div className="px-2 pb-3 grid grid-cols-2 gap-2">
            {MAP_LAYERS.map((layer) => (
              <button
                key={layer.meta.id}
                onClick={() => {
                  setMapLayer(layer);
                  posthog.capture("heatmap_layer_selected", {
                    map_layer: layer.meta.id,
                  });
                }}
                style={{
                  borderRadius: 8,
                  border:
                    mapLayer.meta.id === layer.meta.id
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "transparent",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    background: layer.meta.preview,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapIcon size={14} style={{ color: "#ffffff88" }} />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    padding: "3px 0 4px",
                    color: "var(--sidebar-foreground)",
                    fontWeight: mapLayer.meta.id === layer.meta.id ? 600 : 400,
                    background: "var(--sidebar-accent)",
                    textAlign: "center",
                  }}
                >
                  {layer.meta.label}
                </div>
              </button>
            ))}
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Activity Filter ── */}
        <SidebarGroup>
          <SectionLabel>
            <span className="flex items-center gap-1">
              <ActivityIcon size={10} /> Activity
            </span>
          </SectionLabel>
          <div className="px-2 pb-3 flex flex-wrap gap-1">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setActivity(a.id);
                  posthog.capture("heatmap_activity_filtered", {
                    activity: a.id,
                  });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: activity === a.id ? 600 : 400,
                  background:
                    activity === a.id
                      ? "var(--primary)"
                      : "var(--sidebar-accent)",
                  color:
                    activity === a.id ? "#fff" : "var(--sidebar-foreground)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Buy Me a Coffee ── */}
        <SidebarGroup>
          <div className="px-3 py-3 w-full flex flex-col gap-2">
            <GithubStarsBadge repo="oskarkraemer/komootHeatmap" />

            <a
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 14px",
                borderRadius: 10,
                background: "var(--sidebar-accent)",
                color: "var(--sidebar-foreground)",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                justifyContent: "center",
                transition: "opacity 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              onClick={() => {
                posthog.displaySurvey("019faf6d-251e-0000-9688-2b3d75bc8a7e", {
                  displayType: DisplaySurveyType.Popover,
                  ignoreConditions: true,
                  ignoreDelay: true,
                });
              }}
            >
              <MessageSquareTextIcon size={15} />
              Feedback
            </a>
            <a
              href="https://buymeacoffee.com/oskarkraemer"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 14px",
                borderRadius: 10,
                background: "#FFDD00",
                color: "#000",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                justifyContent: "center",
                transition: "opacity 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <CoffeeIcon size={15} />
              Buy me a coffee
            </a>
            <p
              style={{
                fontSize: 10,
                opacity: 0.4,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Keeps the server running ☕
            </p>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onLogoutClicked={onLogoutClicked} />
      </SidebarFooter>
    </Sidebar>
  );
}
