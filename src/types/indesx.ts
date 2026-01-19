// src/types/index.d.ts

/** User account and access control */
export interface User {
  id: string;
  name: string;
  email: string;
  /** App-level role — determines available dashboard features */
  role: "user" | "policymaker" | "admin";
  createdAt: string;
}

/** Household details tracked under a user's account */
export interface Household {
  id: string;
  /** Number of people in the household */
  members: number;
  /** Preferred or dominant cooking oil type */
  oilType: string;
  /** Optional average oil usage per meal (ml) */
  avgConsumptionPerMeal?: number;
}

/** Individual consumption audit entry */
export interface AuditEntry {
  id: string;
  householdId: string;
  /** Total oil used in ml */
  oilMl: number;
  /** Optional number of meals cooked */
  mealsCount?: number;
  /** ISO timestamp of audit record */
  timestamp: string;
  /** How the entry was recorded */
  method?: "manual" | "iot" | "photo";
}

/** Gamification stats for user engagement */
export interface Gamification {
  userId: string;
  /** Accumulated points based on actions */
  points: number;
  /** Achievements earned */
  badges: string[];
}

/** District-level policy analytics */
export interface DistrictStats {
  /** Name of the district */
  district: string;
  /** Average oil consumption per capita (litres) */
  avgOilPerCapita: number;
  /** 7-day historical trend (for graphing) */
  trend7d: number[];
}

/** Map data for policy visualization (used in PolicyMapClient) */
export interface DistrictDatum {
  district: string;
  lat: number;
  lng: number;
  /** Average oil consumption per capita (litres) */
  avgOil: number;
}

/** Combined type for dashboard or policymaker analytics */
export interface DashboardData {
  user: User;
  household?: Household;
  gamification?: Gamification;
  audits?: AuditEntry[];
  districtStats?: DistrictStats[];
}
