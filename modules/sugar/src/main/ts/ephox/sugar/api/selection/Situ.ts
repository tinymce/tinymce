import { Node as DomNode } from '@ephox/dom-globals';
import { Adt, Fun } from '@ephox/katamari';
import Element from '../node/Element';

export interface Situ {
  fold: <U> (
    before: (element: Element<DomNode>) => U,
    on: (element: Element<DomNode>, offset: number) => U,
    after: (element: Element<DomNode>) => U
  ) => U;
  match: <U> (branches: {
    before: (element: Element<DomNode>) => U;
    on: (element: Element<DomNode>, offset: number) => U;
    after: (element: Element<DomNode>) => U;
  }) => U;
  log: (label: string) => void;
}

const adt: {
  before: (element: Element<DomNode>) => Situ;
  on: (element: Element<DomNode>, offset: number) => Situ;
  after: (element: Element<DomNode>) => Situ;
} = Adt.generate([
  { before: [ 'element' ] },
  { on: [ 'element', 'offset' ] },
  { after: [ 'element' ] }
]);

// Probably don't need this given that we now have "match"
const cata = <U> (subject: Situ, onBefore: (element: Element<DomNode>) => U, onOn: (element: Element<DomNode>, offset: number) => U, onAfter: (element: Element<DomNode>) => U) =>
  subject.fold(onBefore, onOn, onAfter);

const getStart = (situ: Situ) => situ.fold(Fun.identity, Fun.identity, Fun.identity);

const before = adt.before;
const on = adt.on;
const after = adt.after;

// tslint:disable-next-line:variable-name
export const Situ = {
  before,
  on,
  after,
  cata,
  getStart
};
