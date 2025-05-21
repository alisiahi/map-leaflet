import { create } from "zustand";

type SelectedKreis = {
  ags: string;
  gen: string;
} | null;

type SelectionState = {
  selectedKreis: SelectedKreis;
  setSelectedKreis: (kreis: SelectedKreis) => void;
  clearSelectedKreis: () => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedKreis: null,
  setSelectedKreis: (kreis) => set({ selectedKreis: kreis }),
  clearSelectedKreis: () => set({ selectedKreis: null }),
}));
