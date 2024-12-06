import { Patch, applyPatches, produceWithPatches } from "immer";
import {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
  createStore,
} from "zustand";
import { immer } from "zustand/middleware/immer";

const DEFAULT_LIMIT = 10;

interface State {
  pastStates: Patch[][][];
  futureStates: Patch[][][];
}

interface TemporalState {
  undo: (steps?: number) => void;
  redo: (steps?: number) => void;
  clear: () => void;

  _handleSet: (pastState: Patch[][]) => void;
}

type Zundo = <
  TState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<TState, [...Mps, ["temporal", unknown]], Mcs>,
  options?: any
) => StateCreator<
  TState,
  Mps,
  [["temporal", StoreApi<TemporalState & State>], ...Mcs]
>;

export type Write<T, U> = Omit<T, keyof U> & U;
declare module "zustand/vanilla" {
  interface StoreMutators<S, A> {
    temporal: Write<S, { temporal: A }>;
  }
}

export const immerZundo = (<T>(initializer: StateCreator<T, [], []>) => {
  const fn = (
    set: StoreApi<T>["setState"],
    get: StoreApi<T>["getState"],
    store: StoreApi<T> & { temporal: StoreApi<TemporalState & State> }
  ) => {
    // 做一些插件处理
    store.temporal = createStore<TemporalState & State>()(
      immer((set1, get1) => {
        const initialState: State = {
          pastStates: [],
          futureStates: [],
        };
        return {
          ...initialState,
          undo: () => {
            if (get1().pastStates.length) {
              set1((state) => {
                const inversePatches = state.pastStates.pop()!;
                const newState = applyPatches(
                  get() as StoreApi<T>["getState"],
                  inversePatches[1]
                );
                set(newState);
                state.futureStates.push(inversePatches);
              });
            }
          },
          redo: () => {
            if (get1().futureStates.length) {
              set1((state) => {
                const patches = state.futureStates.pop()!;
                const newState = applyPatches(
                  get() as StoreApi<T>["getState"],
                  patches[0]
                );
                set(newState);
                state.pastStates.push(patches);
              });
            }
          },
          clear: () => set1({ pastStates: [], futureStates: [] }),
          _handleSet: (pastState) => {
            set1((state) => {
              if (state.pastStates.length >= DEFAULT_LIMIT) {
                state.pastStates.shift();
              }
              state.futureStates = [];
              state.pastStates.push(pastState);
            });
          },
        };
      })
    );

    // 更改 store.setState 这个是 react 中 useSyncExternalStore 返回的触发，重写 setState 函数
    const setState = store.setState;
    store.setState = (updater: any, replace: any, ...a) => {
      const pastState = get();

      const [nextState, patches, inversePatches] =
        typeof updater === "function"
          ? produceWithPatches(pastState, updater)
          : updater;

      setState(nextState, replace, ...a);

      // 更新 设置缓存
      store.temporal.getState()._handleSet([patches, inversePatches]);
    };

    return initializer(store.setState, get, store);
  };

  return fn;
}) as Zundo;
