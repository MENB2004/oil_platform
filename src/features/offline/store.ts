import { create, StateCreator } from "zustand";
import { set as idbSet, get as idbGet } from "idb-keyval";

export interface OfflineJob {
  id: string;
  path: string;
  payload: any;
  createdAt: number;
}

export interface OfflineState {
  queue: OfflineJob[];
  addJob: (job: OfflineJob) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  loadQueue: () => Promise<void>;
}

// Define the store creator type explicitly to avoid 'any'
const storeCreator: StateCreator<OfflineState> = (set, get) => ({
  queue: [],

  addJob: async (job: OfflineJob) => {
    set((state: OfflineState) => {
      const newQueue = [...state.queue, job];
      void idbSet("offline-queue", newQueue);
      return { queue: newQueue };
    });
  },

  removeJob: async (id: string) => {
    set((state: OfflineState) => {
      const newQueue = state.queue.filter((j: OfflineJob) => j.id !== id);
      void idbSet("offline-queue", newQueue);
      return { queue: newQueue };
    });
  },

  loadQueue: async () => {
    try {
      const q = (await idbGet("offline-queue")) as OfflineJob[] | undefined;
      set({ queue: q || [] });
    } catch (error) {
      console.error("Error loading offline queue:", error);
      set({ queue: [] });
    }
  },
});

export const useOfflineStore = create<OfflineState>(storeCreator);
