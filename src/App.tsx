import { applyPatches, enablePatches, produceWithPatches } from "immer";
import { useStoreWithUndo } from "./store";
import { isPathIncluded } from "./common/isPathIncluded";

enablePatches();

// 示例初始状态
const initialState = {
  user: { name: "Bob", age: 25 },
  settings: { theme: "light", language: "en" },
  arr: [1, 2, 3],
  count: 1,
  count1: 1,
};

type NestedPaths<T, P extends string[] = []> = T extends object
  ? {
      [K in keyof T]: NestedPaths<T[K], [...P, K & string]>;
    }[keyof T]
  : P;
console.log("🚀 liu123 ~ initialState:", initialState);

// 生成 patches 和 inversePatches
const [nextState, patches, inversePatches] = produceWithPatches(
  initialState,
  (draft) => {
    // draft.user.name = "Alice"; // 修改 user.name
    // draft.settings.theme = "dark"; // 修改 settings.theme
    // draft.settings.language = "dark"; // 修改 settings.theme
    // draft.arr[2] = 4; // 修改 arr[3]
    // draft.count = 2;
    // draft.count1 = 2;
    return {
      count: 2,
      count1: 2,
    };
  }
);

// 自定义过滤规则：忽略对 `user` 的修改
const ignorePaths = [["user", "name"], ["settings", "theme"], ["count1"]]; // 要忽略的路径集合

// 过滤 patches 和 inversePatches
const filteredPatches = patches.filter((patch) =>
  isPathIncluded(patch, ignorePaths)
);
const filteredInversePatches = inversePatches.filter((inversePatch) =>
  isPathIncluded(inversePatch, ignorePaths)
);

console.log("原始 patches:", patches);
console.log("过滤后 patches:", filteredPatches);
console.log("🚀 liu123 ~ filteredInversePatches:", filteredInversePatches);

// 使用过滤后的 patches 和 inversePatches
const forwardState = applyPatches(nextState, filteredPatches);
const backwardState = applyPatches(nextState, filteredInversePatches);
console.log("🚀 liu123 ~ backwardState:", backwardState);

console.log("前进状态:", forwardState); // 应该只包含 `settings` 和 `arr` 的变更
console.log("nextState:", nextState);

const App = () => {
  const { count, text, increase, decrease, setText } = useStoreWithUndo();
  // See API section for temporal.getState() for all functions and
  // properties provided by `temporal`, but note that properties, such as `pastStates` and `futureStates`, are not reactive when accessed directly from the store.
  const { undo, redo, clear } = useStoreWithUndo.temporal.getState();

  return (
    <>
      count: {count}
      text: {text}
      <button onClick={() => increase()}>increase</button>
      <button onClick={() => decrease()}>decrease</button>
      <button onClick={() => setText("hello")}>set text</button>
      <button onClick={() => undo()}>undo</button>
      <button onClick={() => redo()}>redo</button>
      <button onClick={() => clear()}>clear</button>
    </>
  );
};

export default App;
