import { create } from "zustand";
import type { Client } from "@/types/client";

interface ClientState {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addSelectedId: (id: string) => void;
  removeSelectedId: (id: string) => void;
  clearSelectedIds: () => void;

  // For editing
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  selectedIds: [],
  setSelectedIds: (ids: string[]) => set({ selectedIds: ids }),
  addSelectedId: (id: string) =>
    set((state: ClientState) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds
        : [...state.selectedIds, id],
    })),
  removeSelectedId: (id: string) =>
    set((state: ClientState) => ({
      selectedIds: state.selectedIds.filter((itemId: string) => itemId !== id),
    })),
  clearSelectedIds: () => set({ selectedIds: [] }),

  // For editing
  selectedClient: null,
  setSelectedClient: (client: Client | null) => set({ selectedClient: client }),
}));
