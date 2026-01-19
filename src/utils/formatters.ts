// src/utils/formatters.ts
export function fmtDateShort(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export function mlToKg(ml: number) {
  // assume oil density ≈ 0.92 g/ml -> 1000 ml ≈ 0.92 kg, but common conversion for tracking:
  return (ml * 0.00092);
}

export function round(n: number, dp = 2) {
  return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp);
}
