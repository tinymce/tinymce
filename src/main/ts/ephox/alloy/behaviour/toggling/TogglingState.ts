import { TogglingState } from "./TogglingTypes";
import { Cell } from "@ephox/katamari";


const init = (spec): TogglingState => {
  const cell = Cell(false);

  const set = (state: boolean) => cell.set(state);
  const clear = () => cell.set(false);
  const get = () => cell.get();

  const readState = () => {
    return cell.get()
  };

  return {
    readState,
    get,
    set,
    clear
  }
};

export {
  init
}