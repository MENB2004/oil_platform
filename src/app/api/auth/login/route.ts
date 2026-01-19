import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Very small validation & mock logic for demo
    if (!email || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    // In production: replace with real DB lookup + password check.
    // For demo: any password "password123" is accepted; otherwise fail.
    if (password !== "password123") {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // produce a fake token
    const fakeToken = "oc_demo_token_" + Math.random().toString(36).slice(2, 10);

    return NextResponse.json({ token: fakeToken, email }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
