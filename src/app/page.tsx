// src/app/page.tsx
"use client";

import Link from "next/link";
import React from "react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors">
     

      {/* Make hero fill remaining space and center its content.
          Using flex-1 ensures footer sits at bottom when content is short. */}
      <main className="flex-1 flex flex-col">
        <section
          className="flex-1 flex items-center justify-center text-center px-6
                     bg-gradient-to-b from-amber-100 to-zinc-50
                     dark:from-zinc-900 dark:to-black"
          style={{ minHeight: "60vh" }} // ensures it looks balanced on tall screens
        >
          <div className="w-full max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-zinc-50">
              Let’s Make India Healthier
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-zinc-700 dark:text-zinc-300 mb-8">
              Track your cooking oil usage, discover healthier recipes, and join
              the national campaign to reduce edible oil consumption by 10%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/audit"
                className="px-6 py-3 rounded-full bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 transition"
              >
                Track Consumption
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full border border-amber-500 text-amber-600 font-semibold hover:bg-amber-100 dark:hover:bg-zinc-800 transition"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="grid md:grid-cols-3 gap-8 px-10 py-20 max-w-6xl mx-auto"
        >
          {[
            {
              title: "AI-powered Insights",
              desc: "Get personalized feedback on your oil consumption and health indicators.",
            },
            {
              title: "Rewards & Challenges",
              desc: "Earn points and badges for maintaining healthy cooking habits.",
            },
            {
              title: "Real-time Dashboards",
              desc: "Policy makers and households can monitor consumption patterns live.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © 2025 National Healthy Eating Initiative | Made with ❤️ in India
        </p>
      </footer>
    </div>
  );
}
