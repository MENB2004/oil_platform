//src/app/policymaker/page.tsx


import PolicyMapLoader from "@/components/PolicyMapLoader";
import { use } from "react";

export default function PolicymakerPage() {
  const mockData = [
    { district: "Chennai", lat: 13.0827, lng: 80.2707, avgOil: 12.3 },
    { district: "Bengaluru", lat: 12.9716, lng: 77.5946, avgOil: 9.8 },
  ];

  return (
    <main className="p-8 space-y-6 h-[100vh]">
      <h1 className="text-2xl font-semibold">District-level Oil Consumption</h1>
      <PolicyMapLoader data={mockData} />
    </main>
  );
}
