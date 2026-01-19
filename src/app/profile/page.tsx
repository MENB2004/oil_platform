// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";

type Profile = {
  email: string;
  name: string;
  role: string;
  organization: string;
  joinedDate: string;
  lastActive: string;
  location: { city: string; state: string; country: string };
  bio: string;
  stats: { auditsCompleted: number; monthlyAvgConsumptionLitres: number; devicesConnected: number };
  permissions: { viewDashboard: boolean; runAudits: boolean; policymakerControls: boolean };
};

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message || "Failed to fetch profile");
        }
        return res.json();
      })
      .then((data: Profile) => setProfile(data))
      .catch((err) => setError(err.message || "Error"))
      .finally(() => setLoading(false));
  }, [user, token]);

  const initials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const downloadCSV = (p: Profile) => {
    const rows = [
      ["Name", p.name],
      ["Email", p.email],
      ["Role", p.role],
      ["Organization", p.organization],
      ["Joined Date", p.joinedDate],
      ["Last Active", p.lastActive],
      ["City", p.location.city],
      ["State", p.location.state],
      ["Country", p.location.country],
      ["Bio", p.bio],
      ["Audits Completed", String(p.stats.auditsCompleted)],
      ["Monthly Avg Consumption (L)", String(p.stats.monthlyAvgConsumptionLitres)],
      ["Devices Connected", String(p.stats.devicesConnected)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.email.replace(/[@]/g, "_")}_profile.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center p-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow max-w-md text-center">
            <h2 className="text-xl font-semibold mb-3">Not signed in</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Please sign in to view your profile.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {initials(profile?.name || user.email)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile?.name || user.email}</h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {profile?.role ?? "—"} • {profile?.organization ?? "—"}
                  </p>
                </div>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => alert("Edit profile - implement backend to save changes")}
                  className="px-4 py-2 rounded bg-amber-500 text-white text-sm font-medium"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => profile && downloadCSV(profile)}
                  className="px-4 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm"
                >
                  Download report
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <h3 className="text-sm font-semibold mb-2">Account</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Joined: {profile?.joinedDate ?? "—"}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Last active: {profile ? new Date(profile.lastActive).toLocaleString() : "—"}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Location: {profile ? `${profile.location.city}, ${profile.location.state}` : "—"}</p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <h3 className="text-sm font-semibold mb-2">Stats</h3>
                <div className="flex flex-col gap-2">
                  <div className="text-sm">
                    <span className="font-medium">{profile?.stats.auditsCompleted ?? "—"}</span>
                    <span className="ml-2 text-zinc-600 dark:text-zinc-400">Audits completed</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{profile?.stats.monthlyAvgConsumptionLitres ?? "—"} L</span>
                    <span className="ml-2 text-zinc-600 dark:text-zinc-400">Avg / month</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{profile?.stats.devicesConnected ?? "—"}</span>
                    <span className="ml-2 text-zinc-600 dark:text-zinc-400">Devices connected</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <h3 className="text-sm font-semibold mb-2">Permissions</h3>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li>View dashboard: {profile?.permissions.viewDashboard ? "Yes" : "No"}</li>
                  <li>Run audits: {profile?.permissions.runAudits ? "Yes" : "No"}</li>
                  <li>Policymaker controls: {profile?.permissions.policymakerControls ? "Yes" : "No"}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Bio</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{profile?.bio ?? "—"}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Raw JSON (demo)</h3>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-xs overflow-auto">
                {loading && "Loading..."}
                {error && `Error: ${error}`}
                {!loading && !error && profile && JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
