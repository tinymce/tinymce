import { Element, SelectionDirection, Selection, SimRange } from '@ephox/sugar';
import { Window } from '@ephox/dom-globals';
import { Situs } from './Situs';

const convertToRange = function (win: Window, selection: Selection) {
  // TODO: Use API packages of sugar
  const rng = SelectionDirection.asLtrRange(win, selection);
  return SimRange.create(
    Element.fromDom(rng.startContainer),
    rng.startOffset,
    Element.fromDom(rng.endContainer),
    rng.endOffset);
};

const makeSitus = Situs.create;

export {
  convertToRange,
  makeSitus
};
