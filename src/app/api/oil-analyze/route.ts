// src/app/api/oil-analyze/route.ts
import { NextResponse } from "next/server";

/**
 * Mock image analysis endpoint.
 * Expects a multipart/form-data POST with field "image".
 * Returns a JSON payload:
 * { estimatedOilMl: number, confidence: number, detected: string, sizeKb: number }
 *
 * Replace the mock logic with your real ML inference later.
 */
export async function POST(req: Request) {
  try {
    // Parse incoming form-data (supported by Next's Request in App Router)
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }

    // Read file bytes to estimate size and (optionally) pass to a model
    const arrayBuffer = await file.arrayBuffer();
    const sizeKb = Math.round(arrayBuffer.byteLength / 1024);

    // --- Mock analysis logic ---
    // (1) pick a random plausible detected food
    const foodCandidates = [
      "vegetable curry",
      "fried snack",
      "lentil stew (daal)",
      "flatbread",
      "pancake",
      "rice + curry",
      "mixed veg stir-fry",
    ];
    const detected = foodCandidates[Math.floor(Math.random() * foodCandidates.length)];

    // (2) produce a mock oil estimate (ml) using a simple heuristic
    // larger images -> slightly larger base estimate (just for demo)
    const base = Math.min(250, Math.max(30, Math.round(sizeKb / 8)));
    const jitter = Math.round((Math.random() - 0.5) * 30); // ±15 ml
    const estimatedOilMl = Math.max(5, base + jitter);

    // (3) confidence: random but scaled by image size (larger images -> slighty better)
    const confidence = Math.min(99.9, Math.max(30, +(40 + (sizeKb / 10) + Math.random() * 30).toFixed(1)));

    // Return a simple JSON response suitable for UI display
    return NextResponse.json({
      estimatedOilMl,
      confidence,
      detected,
      sizeKb,
      message: "Mock analysis complete",
    });
  } catch (err) {
    console.error("oil-analyze error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
