import { create } from "zustand";
import { zustandPatchUndo } from "./plugin";

export const useStoreWithUndo = create()(
  zustandPatchUndo((set) => ({
    count: 0,
    text: "",
    increase: () => set((state) => ({ count: state.count + 1 })),
    decrease: () => set((state) => ({ count: state.count - 1 })),
    setText: (text: string) => set({ text }),
  }))
);
