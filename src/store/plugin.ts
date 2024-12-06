import { applyPatches, produceWithPatches } from "immer";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

const DEFAULT_LIMIT = 10;

export const immerZundo = (initializer) => (set, get, store) => {
  // 做一些插件处理
  store.temporal = createStore(immer(temporalStateCreator(set, get)));

  const temporalHandleSet = (pastState) => {
    const currentState = get();
    store.temporal
      .getState()
      ._handleSet(pastState, undefined, currentState, undefined);
  };

  // 更改 store.setState 这个是 react 中 useSyncExternalStore 返回的触发，重写 setState 函数
  const setState = store.setState;
  store.setState = (updater, replace, ...a) => {
    const pastState = get();

    const [nextState, patches, inversePatches] =
      typeof updater === "function"
        ? produceWithPatches(pastState, updater)
        : updater;

    setState(nextState, replace, ...a);

    // 更新 设置缓存
    temporalHandleSet([patches, inversePatches]);
  };

  return initializer(store.setState, get, store);
};

const temporalStateCreator = (userSet, userGet) => (set, get) => {
  return {
    pastStates: [],
    futureStates: [],
    undo: () => {
      if (get().pastStates.length) {
        set((state) => {
          const inversePatches = state.pastStates.pop();
          const newState = applyPatches(userGet(), inversePatches[1]);
          userSet(newState);
          state.futureStates.push(inversePatches);
        });
      }
    },
    redo: () => {
      if (get().futureStates.length) {
        set((state) => {
          const patches = state.futureStates.pop()!;
          const newState = applyPatches(userGet(), patches[0]);
          userSet(newState);
          state.pastStates.push(patches);
        });
      }
    },
    clear: () => set({ pastStates: [], futureStates: [] }),
    _onSave: undefined,
    _handleSet: (pastState) => {
      set((state) => {
        if (state.pastStates.length >= DEFAULT_LIMIT) {
          state.pastStates.shift();
        }
        state.futureStates = [];
        state.pastStates.push(pastState);
      });
    },
  };
};
