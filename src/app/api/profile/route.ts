// src/app/api/profile/route.ts
import { NextResponse } from "next/server";

function makeNameFromEmail(email: string) {
  const local = email.split("@")[0];
  const parts = local.split(/[\.\-_]/).filter(Boolean);
  if (parts.length === 0) return email;
  return parts.map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token } = body || {};

    if (!email || !token) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    // demo token format used by the mock AuthProvider: oc_demo_token_xxx
    if (typeof token !== "string" || !token.startsWith("oc_demo_token_")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const name = makeNameFromEmail(email);
    const now = new Date();
    const joined = new Date(now.getFullYear() - 1, 5, 12); // example: joined ~1 year ago
    const lastActive = now.toISOString();

    // Demo profile payload — adjust fields as needed for your project
    const profile = {
      email,
      name,
      role: email.endsWith("@gov.in") ? "Policymaker" : "Household Member",
      organization: email.endsWith("@gov.in") ? "Ministry of Health" : "Household",
      joinedDate: joined.toISOString().split("T")[0],
      lastActive,
      location: {
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
      },
      bio:
        "Enthusiastic participant in the National Healthy Eating Initiative. Tracks household oil usage and participates in community challenges.",
      stats: {
        auditsCompleted: Math.floor(Math.random() * 50) + 5,
        monthlyAvgConsumptionLitres: +(Math.random() * 4 + 1).toFixed(2),
        devicesConnected: Math.floor(Math.random() * 3),
      },
      permissions: {
        viewDashboard: true,
        runAudits: true,
        policymakerControls: email.endsWith("@gov.in"),
      },
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
