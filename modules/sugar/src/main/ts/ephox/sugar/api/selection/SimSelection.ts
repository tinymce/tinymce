import { Adt } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as Traverse from '../search/Traverse';
import { SimRange } from './SimRange';
import { Situ } from './Situ';

export interface SimSelection {
  fold: <U> (
    domRange: (rng: Range) => U,
    relative: (startSitu: Situ, finishSitu: Situ) => U,
    exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U
  ) => U;
  match: <U> (branches: {
    domRange: (rng: Range) => U;
    relative: (startSitu: Situ, finishSitu: Situ) => U;
    exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U;
  }) => U;
  log: (label: string) => void;
}

// Consider adding a type for "element"
const adt: {
  domRange: (rng: Range) => SimSelection;
  relative: (startSitu: Situ, finishSitu: Situ) => SimSelection;
  exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SimSelection;
} = Adt.generate([
  { domRange: [ 'rng' ] },
  { relative: [ 'startSitu', 'finishSitu' ] },
  { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

const exactFromRange = (simRange: SimRange): SimSelection =>
  adt.exact(simRange.start, simRange.soffset, simRange.finish, simRange.foffset);

const getStart = (selection: SimSelection): SugarElement<Node> =>
  selection.match({
    domRange: (rng) => SugarElement.fromDom(rng.startContainer),
    relative: (startSitu, _finishSitu) => Situ.getStart(startSitu),
    exact: (start, _soffset, _finish, _foffset) => start
  });

const domRange = adt.domRange;
const relative = adt.relative;
const exact = adt.exact;

const getWin = (selection: SimSelection): SugarElement<Window> => {
  const start = getStart(selection);
  return Traverse.defaultView(start);
};

// This is out of place but it's API so I can't remove it
const range = SimRange.create;

// tslint:disable-next-line:variable-name
export const SimSelection = {
  domRange,
  relative,
  exact,
  exactFromRange,
  getWin,
  range
};
