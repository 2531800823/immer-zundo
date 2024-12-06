import { enableMapSet, enablePatches } from "immer";
import { useStoreWithUndo } from "./store";

enableMapSet();
enablePatches();

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
