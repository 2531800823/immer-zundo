import { Patch, applyPatches, produceWithPatches, enablePatches } from "immer";
import {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
  createStore,
} from "zustand";
import { immer } from "zustand/middleware/immer";
enablePatches();
// 历史记录的最大存储数量
const MAX_HISTORY_LIMIT = 10;

interface HistoryState {
  undoStack: Patch[][][]; // 撤销栈
  redoStack: Patch[][][]; // 重做栈
}

interface TimelineActions {
  /** 撤销操作 */
  undo: (steps?: number) => void;
  /** 重做操作 */
  redo: (steps?: number) => void;
  /** 清空历史记录 */
  clear: () => void;
  /** 处理状态变更 */
  _handleStateChange: (patches: Patch[][]) => void;
}

type ImmerZundoMiddleware = <
  TState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<
    TState,
    [...Mps, ["temporal", unknown], ["zustand/immer", never]],
    Mcs
  >,
  options?: any
) => StateCreator<
  TState,
  Mps,
  [
    ["temporal", StoreApi<TimelineActions & HistoryState>],
    ["zustand/immer", never],
    ...Mcs
  ]
>;

export type Write<T, U> = Omit<T, keyof U> & U;
declare module "zustand/vanilla" {
  interface StoreMutators<S, A> {
    temporal: Write<S, { temporal: A }>;
  }
}

export const zustandPatchUndo = (<T>(initializer: StateCreator<T, [], []>) => {
  const fn = (
    set: StoreApi<T>["setState"],
    get: StoreApi<T>["getState"],
    store: StoreApi<T> & { temporal: StoreApi<TimelineActions & HistoryState> }
  ) => {
    // 创建时间线存储
    store.temporal = createStore<TimelineActions & HistoryState>()(
      immer((setHistory, getHistory) => {
        const initialState: HistoryState = {
          undoStack: [],
          redoStack: [],
        };
        return {
          ...initialState,
          undo: () => {
            if (getHistory().undoStack.length) {
              setHistory((state) => {
                const lastPatches = state.undoStack.pop()!;
                const newState = applyPatches(
                  get() as StoreApi<T>["getState"],
                  lastPatches[1]
                );
                set(newState);
                state.redoStack.push(lastPatches);
              });
            }
          },
          redo: () => {
            if (getHistory().redoStack.length) {
              setHistory((state) => {
                const nextPatches = state.redoStack.pop()!;
                const newState = applyPatches(
                  get() as StoreApi<T>["getState"],
                  nextPatches[0]
                );
                set(newState);
                state.undoStack.push(nextPatches);
              });
            }
          },
          clear: () => setHistory({ undoStack: [], redoStack: [] }),
          _handleStateChange: (patches) => {
            setHistory((state) => {
              if (state.undoStack.length >= MAX_HISTORY_LIMIT) {
                state.undoStack.shift();
              }
              state.redoStack = []; // 清空重做栈
              state.undoStack.push(patches);
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
          : produceWithPatches(pastState, (draft) => {
              Object.keys(updater).forEach((item) => {
                (draft as Record<string, any>)[item] = updater[item];
              });
            });

      setState(nextState, replace, ...a);

      // 更新 设置缓存
      store.temporal.getState()._handleStateChange([patches, inversePatches]);
    };

    return initializer(store.setState, get, store);
  };

  return fn;
}) as ImmerZundoMiddleware;
