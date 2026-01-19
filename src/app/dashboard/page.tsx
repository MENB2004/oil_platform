//src/app/dashboard/page.tsx
"use client";

import ConsumptionChart from "@/components/charts/ConsumptionChart";

const sampleData = [
  { date: "Mon", oilMl: 50 },
  { date: "Tue", oilMl: 70 },
  { date: "Wed", oilMl: 45 },
  { date: "Thu", oilMl: 30 },
  { date: "Fri", oilMl: 60 },
  { date: "Sat", oilMl: 55 },
  { date: "Sun", oilMl: 40 },
];

export default function DashboardPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto h-[100vh]">
      <h1 className="text-2xl font-semibold mb-6">Your Weekly Oil Usage</h1>
      <ConsumptionChart data={sampleData} />
      <div className="mt-8 text-lg text-zinc-700 dark:text-zinc-300">
        <p>
          You’ve reduced oil consumption by <b>12%</b> this week! 🎉 Keep it up
          and earn <b>50 reward points</b>.
        </p>
      </div>
    </main>
  );
}
