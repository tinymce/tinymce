import { ReflectingState } from "./ReflectingTypes";
import { Cell, Option } from "@ephox/katamari";


const init = <S>(spec): ReflectingState<S> => {
  const cell = Cell(Option.none());

  const set = (optS: Option<S>) => cell.set(optS);
  const clear = () => cell.set(Option.none());
  const get = () => cell.get();

  const readState = () => {
    return cell.get().getOr('none')
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