import { SelectionDirection, SimRange, SimSelection, SugarElement } from '@ephox/sugar';
import { Situs } from './Situs';

const convertToRange = function (win: Window, selection: SimSelection) {
  // TODO: Use API packages of sugar
  const rng = SelectionDirection.asLtrRange(win, selection);
  return SimRange.create(
    SugarElement.fromDom(rng.startContainer),
    rng.startOffset,
    SugarElement.fromDom(rng.endContainer),
    rng.endOffset);
};

const makeSitus = Situs.create;

export {
  convertToRange,
  makeSitus
};
