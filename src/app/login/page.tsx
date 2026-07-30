"use client";

import { useState } from "react";
import { useKomootUser } from "@/src/contexts/KomootUserContext";
import { HeatmapIcon } from "@/src/lib/icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useKomootUser();

  async function handleLogin(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "An unknown error occurred.");
    }
  }

  const disabled = loading || !email || !password;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-sm flex flex-col">
        {/* Logo */}
        <a href="/">
          <div className="flex items-center gap-2.5 mb-7">
            <HeatmapIcon className="w-8 h-8" />
            <span className="text-base font-bold text-white tracking-tight">
              komoot heatmap
            </span>
          </div>
        </a>

        <h1 className="text-2xl font-bold text-white tracking-tight m-0">
          Sign in
        </h1>
        <p className="text-sm text-[#666] mt-1.5 mb-7">
          Use your Komoot account credentials
        </p>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#aaa]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              placeholder="you@example.com"
              autoComplete="email"
              className="bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#555] placeholder:text-[#444]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#aaa]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#555] placeholder:text-[#444]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-red-400 mb-4 px-3 py-2.5 bg-red-400/8 rounded-lg border border-red-400/20">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={disabled}
          className={`
            text-center gap-2 px-7 py-3.25 rounded-lg bg-[#ff5722] text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#ff5722]/20
            ${disabled ? "opacity-50 cursor-not-allowed hover:opacity-50!" : "opacity-100 cursor-pointer"}
          `}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-[13px] text-[#666] mt-4">
          NOTE: This site is not affiliated with Komoot. Yet, NO credentials
          will be saved on any server.{" "}
          <a
            href="https://github.com/oskarkraemer/komootHeatmap#installation"
            target="_blank"
            className="text-[#ff5722] hover:underline"
          >
            Learn more
          </a>
        </p>
      </div>
    </main>
  );
}
