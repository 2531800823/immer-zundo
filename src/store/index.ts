import { create } from "zustand";
import { immerZundo } from "./plugin";

export const useStoreWithUndo = create()(
  immerZundo((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears) => set({ bears: newBears }),
  }))
);
