import { Adt, Struct } from '@ephox/katamari';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';
import Situ from './Situ';

// Consider adding a type for "element"
const type = Adt.generate([
  { domRange: [ 'rng' ] },
  { relative: [ 'startSitu', 'finishSitu' ] },
  { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

const range = Struct.immutable(
  'start',
  'soffset',
  'finish',
  'foffset'
);

const exactFromRange = function (simRange) {
  return type.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
};

const getStart = function (selection) {
  return selection.match({
    domRange (rng) {
      return Element.fromDom(rng.startContainer);
    },
    relative (startSitu, finishSitu) {
      return Situ.getStart(startSitu);
    },
    exact (start, soffset, finish, foffset) {
      return start;
    }
  });
};

const getWin = function (selection) {
  const start = getStart(selection);

  return Traverse.defaultView(start);
};

const domRange = type.domRange;
const relative = type.relative;
const exact = type.exact;

export { domRange, relative, exact, exactFromRange, range, getWin, };
