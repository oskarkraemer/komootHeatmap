"use client";

import React from "react";
import { GithubIcon, HeatmapIcon } from "../lib/icons";
import GithubStarsBadge from "../components/Landing/GithubStarsBadge";
import BuyMeACoffeePopup from "../components/Landing/BuyMeACoffePopup";

// ─── Reusable Showcase Card Component ────────────────────────────────────────

interface ShowcaseCardProps {
  title: string;
  desc: string;
  imageSrc: string;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  title,
  desc,
  imageSrc,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative bg-[#06090d]">
        <img src={imageSrc} alt={title} className="w-full h-48 object-cover" />
      </div>
      <div className="p-4 sm:p-5 border-t border-border">
        <div className="text-sm sm:text-base font-bold text-white mb-1">
          {title}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
};

// ─── Main Landing Page Component ─────────────────────────────────────────────

export default function KomootHeatmapLanding() {
  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen selection:bg-[#ff5722] selection:text-white">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-14 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2.25 font-bold text-[15px] tracking-[-0.02em] text-white">
          <HeatmapIcon className="w-5.5 h-5.5" />
          komoot heatmap
        </div>
        <div className="flex items-center gap-2">
          <GithubStarsBadge repo="oskarkraemer/komootHeatmap" />

          <a
            href="/heatmap"
            className="px-4 py-2.5 rounded-md bg-[#ff5722] text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in →
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <img
          src="/hero.png"
          alt="Komoot Heatmap Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        <div className="relative z-10 max-w-170">
          <div className="inline-flex items-center gap-1.75 px-3 py-1 rounded-full border border-[#ff5722]/30 bg-[#ff5722]/10 text-[12px] font-semibold text-[#ff5722] tracking-wider uppercase mb-6">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" fill="#ff5722" />
            </svg>
            Works with your Komoot account
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-tight leading-[1.05] mb-5 text-white">
            Every ride you've ever done,
            <br />
            <em className="not-italic bg-linear-to-r from-[#ff5722] to-[#ffb300] bg-clip-text text-transparent">
              on one map.
            </em>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-130 mx-auto mb-9 leading-relaxed">
            Connect your Komoot account and explore all your routes as an
            interactive heatmap.
          </p>

          {/* <a
            href="https://komoot.oskarkraemer.me"
            className="inline-flex items-center gap-1.75 px-3 py-1 rounded-full border border-[#FFDD00]/30 bg-[#FFDD00]/10 text-[12px] font-semibold text-[#FFDD00] tracking-wider uppercase mb-4"
          >
            Switch to classic version
          </a> */}

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/heatmap"
              className="inline-flex items-center gap-2 px-7 py-3.25 rounded-lg bg-[#ff5722] text-white text-sm font-semibold hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#ff5722]/20"
            >
              <HeatmapIcon className="w-4 h-4" />
              Open Heatmap
            </a>
            <a
              href="https://github.com/oskarkraemer/komootHeatmap"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-card text-[#dde3ec] text-sm font-medium border border-border hover:bg-[#0e1219] hover:border-[#2e3748] transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              View source
            </a>
          </div>
        </div>
      </section>

      {/* ── Showcase Section ─────────────────────────────────── */}
      <div className="h-px bg-border max-w-275 mx-auto" />
      <section className="py-20 px-6 max-w-275 mx-auto">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#ff5722] mb-3">
          Visualizations
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-tight text-white mb-3.5">
          Five ways to see your data
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-130 leading-relaxed mb-14">
          Switch between visualization modes to reveal different patterns in
          your activity history.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ShowcaseCard
            title="🔥 Heatmap"
            desc="Paths you ride most often glow brightest."
            imageSrc="/heatmap.png"
          />

          <ShowcaseCard
            title="⚡ Speed"
            desc="Blue for slow segments, cyan for fast descents. It shows your fastest segments across every route."
            imageSrc="/speed.png"
          />

          <ShowcaseCard
            title="⛰ Incline"
            desc="Green for flat, red for steep. Identify the hardest climbs you've ridden."
            imageSrc="/incline.png"
          />

          <ShowcaseCard
            title="📅 Year"
            desc="Each year has a different colour. Watch how your range and favourite areas have evolved over time."
            imageSrc="/year.png"
          />

          <ShowcaseCard
            title="⏱ Elapsed time"
            desc="Differenciate between short and long rides. See which routes you push hard and which you take easy."
            imageSrc="/time.png"
          />
        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────── */}
      <div className="h-px bg-border max-w-275 mx-auto" />
      <section className="py-20 px-6 max-w-275 mx-auto">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#ff5722] mb-3">
          How it works
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-tight text-white mb-3.5">
          Up and running in 30 seconds
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-130 leading-relaxed mb-14">
          No complicated import needed
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-border border border-border rounded-xl overflow-hidden">
          <div className="bg-card p-7 sm:p-8">
            <div className="text-[11px] font-bold tracking-wider text-[#ff5722] uppercase mb-3.5">
              Step 01
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/20 flex items-center justify-center text-lg mb-4">
              🔑
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sign in with Komoot
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your credentials go directly to Komoot's API. We never store your
              password.
            </p>
          </div>

          <div className="bg-card p-7 sm:p-8">
            <div className="text-[11px] font-bold tracking-wider text-[#ff5722] uppercase mb-3.5">
              Step 02
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/20 flex items-center justify-center text-lg mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Automatic sync
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All your tours are fetched and cached locally in your browser.
              Only new rides are downloaded on return visits.
            </p>
          </div>

          <div className="bg-card p-7 sm:p-8">
            <div className="text-[11px] font-bold tracking-wider text-[#ff5722] uppercase mb-3.5">
              Step 03
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/20 flex items-center justify-center text-lg mb-4">
              🗺
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Explore</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Switch visualisations, filter by sport, adjust line width, and
              switch map layers.
            </p>
          </div>
        </div>
      </section>

      {/* ── Privacy & Trust Section ──────────────────────────── */}
      <div className="h-px bg-border max-w-275 mx-auto" />
      <section className="py-20 px-6 max-w-275 mx-auto">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#ff5722] mb-3">
          Privacy & trust
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-tight text-white mb-3.5">
          Your data stays yours
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-130 leading-relaxed mb-14">
          Built with privacy in mind from the ground up.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-5.5 flex gap-3.5 items-start">
            <div className="text-2xl shrink-0 mt-0.5">💾</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Cached in your browser
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Route data is stored in IndexedDB on your device. Nothing is
                uploaded to any server.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5.5 flex gap-3.5 items-start">
            <div className="text-2xl shrink-0 mt-0.5">📖</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Fully open source
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every line of code is on GitHub. You can verify the code or even
                self-host the project.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5.5 flex gap-3.5 items-start">
            <div className="text-2xl shrink-0 mt-0.5">🚫</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">No ads</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No monetisation of your activity data. Ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <div className="py-20 px-6">
        <div className="max-w-275 mx-auto bg-card border border-border rounded-2xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(255,87,34,0.08)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-[38px] font-extrabold tracking-tight text-white mb-2.5">
              Ready to see all your rides?
            </h2>
            <p className="text-base text-muted-foreground">
              Free, open source, and takes 30 seconds to set up.
            </p>
          </div>

          <div className="relative z-10 flex gap-2.5 shrink-0 flex-wrap w-full md:w-auto">
            <a
              href="/heatmap"
              className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3.25 rounded-lg bg-[#ff5722] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Connect Komoot →
            </a>
            <a
              href="https://buymeacoffee.com/oskarkraemer"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FFDD00] text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border px-8 py-7 flex items-center justify-between flex-wrap gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-[#dde3ec]">
          <HeatmapIcon className="w-4 h-4" />
          komoot heatmap
        </div>
        <div className="flex gap-5">
          <a
            href="https://github.com/oskarkraemer/komootHeatmap"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#dde3ec] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://buymeacoffee.com/oskarkraemer"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#dde3ec] transition-colors"
          >
            Buy me a coffee
          </a>
          <a href="/heatmap" className="hover:text-[#dde3ec] transition-colors">
            Sign in
          </a>
        </div>
      </footer>
    </div>
  );
}
