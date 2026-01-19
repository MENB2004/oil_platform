// src/components/gamification/BadgeList.tsx
import React from "react";

export default function BadgeList({ badges }: { badges: string[] }) {
  if (!badges.length) return <p className="text-sm text-zinc-500">No badges yet — start tracking!</p>;
  return (
    <div className="flex gap-3 flex-wrap">
      {badges.map((b) => (
        <div key={b} className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">
          {b}
        </div>
      ))}
    </div>
  );
}
