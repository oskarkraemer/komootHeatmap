"use client";
import { GithubIcon } from "@/src/lib/icons";
import { useEffect, useState } from "react";

export default function GithubStarsBadge({ repo }: { repo: string }) {
  const [data, setData] = useState<{
    stars: number;
    forks: number;
    desc: string;
  } | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => r.json())
      .then((d) =>
        setData({
          stars: d.stargazers_count,
          forks: d.forks_count,
          desc: d.description,
        }),
      )
      .catch(() => {});
  }, [repo]);

  const fmt = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener"
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors no-underline"
    >
      <GithubIcon className="w-4 h-4 text-white/80" />
      <span className="text-sm text-white/80 hidden md:inline">
        {repo.split("/")[1]}
      </span>
      {data && (
        <span className="flex items-center gap-1 ml-auto text-amber-400 text-sm font-medium">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
          </svg>
          {fmt(data.stars)}
        </span>
      )}
    </a>
  );
}
