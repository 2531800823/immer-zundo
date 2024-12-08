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

interface MyState {
  count: {
    a: number;
  };
  count2: number;
  myString: string;
  string2: string;
  boolean1: true;
  boolean2: false;
}
interface Action {
  increment: () => void;
  incrementCountOnly: () => void;
  incrementCount2Only: () => void;
  decrement: () => void;
  doNothing: () => void;
}

type all = MyState & Action;

const initialState: MyState = {
  count: {
    a: 1,
  },
  count2: 0,
  myString: "hello",
  string2: "world",
  boolean1: true,
  boolean2: false,
};

type NestedPaths<T, P extends string[] = []> = T extends object
  ? {
      [K in keyof T]: NestedPaths<T[K], [...P, K & string]>;
    }[keyof T]
  : P;

type Path = NestedPaths<MyState & Action>; // 自动生成路径类型

const ignorePaths: Path[] = [["boolean1"], ["count", "a"]];
