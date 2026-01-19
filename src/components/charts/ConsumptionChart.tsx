// src/components/charts/ConsumptionChart.tsx
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type ConsumptionPoint = { date: string; oilMl: number };

export default function ConsumptionChart({ data }: { data: ConsumptionPoint[] }) {
  return (
    <div className="w-full h-[320px] bg-white dark:bg-zinc-900 p-3 rounded-xl shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="oilMl" stroke="#f59e0b" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
