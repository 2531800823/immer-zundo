import { enableMapSet, enablePatches } from "immer";
import { useStoreWithUndo } from "./store";

enableMapSet();
enablePatches();

const App = () => {
  const { bears, increasePopulation, removeAllBears } = useStoreWithUndo();
  // See API section for temporal.getState() for all functions and
  // properties provided by `temporal`, but note that properties, such as `pastStates` and `futureStates`, are not reactive when accessed directly from the store.
  const { undo, redo, clear } = useStoreWithUndo.temporal.getState();

  return (
    <>
      bears: {bears}
      <button onClick={() => increasePopulation()}>increase</button>
      <button onClick={() => removeAllBears()}>remove</button>
      <button onClick={() => undo()}>undo</button>
      <button onClick={() => redo()}>redo</button>
      <button onClick={() => clear()}>clear</button>
    </>
  );
};

export default App;
