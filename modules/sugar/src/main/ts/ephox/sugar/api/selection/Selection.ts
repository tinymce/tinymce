import { Node as DomNode, Range } from '@ephox/dom-globals';
import { Adt } from '@ephox/katamari';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';
import { SimRange } from './SimRange';
import { Situ } from './Situ';

export interface Selection {
  fold: <U> (
    domRange: (rng: Range) => U,
    relative: (startSitu: Situ, finishSitu: Situ) => U,
    exact: (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => U
  ) => U;
  match: <U> (branches: {
    domRange: (rng: Range) => U;
    relative: (startSitu: Situ, finishSitu: Situ) => U;
    exact: (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => U;
  }) => U;
  log: (label: string) => void;
}

// Consider adding a type for "element"
const adt: {
  domRange: (rng: Range) => Selection;
  relative: (startSitu: Situ, finishSitu: Situ) => Selection;
  exact: (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => Selection;
} = Adt.generate([
  { domRange: [ 'rng' ] },
  { relative: [ 'startSitu', 'finishSitu' ] },
  { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

const exactFromRange = (simRange: SimRange) => adt.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());

const getStart = (selection: Selection) => selection.match({
  domRange: (rng) => Element.fromDom(rng.startContainer),
  relative: (startSitu, _finishSitu) => Situ.getStart(startSitu),
  exact: (start, _soffset, _finish, _foffset) => start
});

const domRange = adt.domRange;
const relative = adt.relative;
const exact = adt.exact;

const getWin = (selection: Selection) => {
  const start = getStart(selection);
  return Traverse.defaultView(start);
};

// This is out of place but it's API so I can't remove it
const range = SimRange.create;

// tslint:disable-next-line:variable-name
export const Selection = {
  domRange,
  relative,
  exact,
  exactFromRange,
  getWin,
  range
};
