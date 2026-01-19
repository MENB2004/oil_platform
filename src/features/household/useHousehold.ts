// src/features/household/useHousehold.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Household = {
  id: string;
  members: number;
  oilType: string;
  avgConsumptionPerMeal?: number;
};

export function useHousehold(householdId: string) {
  return useQuery<Household>({
    queryKey: ["household", householdId],
    queryFn: async () => {
      // replace with real API later
      const { data } = await api.get(`/households/${householdId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: {
      id: householdId,
      members: 4,
      oilType: "Sunflower",
      avgConsumptionPerMeal: 15,
    },
  });
}
