"use client";
import dynamic from "next/dynamic";

const HeatmapMap = dynamic(() => import("./HeatmapMap"), {
  ssr: false,
});

export { HeatmapMap };
