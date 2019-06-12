import { Adt, Fun } from '@ephox/katamari';
import Element from '../node/Element';

export interface Situ {
  fold: <U> (
    before: (element: Element) => U,
    on: (element: Element, offset: number) => U,
    after: (element: Element) => U
  ) => U;
  match: <U> (branches: {
    before: (element: Element) => U,
    on: (element: Element, offset: number) => U,
    after: (element: Element) => U,
  }) => U;
  log: (label: string) => void;
}

const adt: {
  before: (element: Element) => Situ,
  on: (element: Element, offset: number) => Situ,
  after: (element: Element) => Situ
} = Adt.generate([
  { before: ['element'] },
  { on: ['element', 'offset'] },
  { after: ['element'] }
]);

// Probably don't need this given that we now have "match"
const cata = function <U> (subject: Situ, onBefore: (element: Element) => U, onOn: (element: Element, offset: number) => U, onAfter: (element: Element) => U) {
  return subject.fold(onBefore, onOn, onAfter);
};

const getStart = function (situ: Situ) {
  return situ.fold(Fun.identity, Fun.identity, Fun.identity);
};

const before = adt.before;
const on = adt.on;
const after = adt.after;

// tslint:disable-next-line:variable-name
export const Situ = {
  before,
  on,
  after,
  cata,
  getStart,
};