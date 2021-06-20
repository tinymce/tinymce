import { Adt, Fun } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';

export interface Situ {
  fold: <U> (
    before: (element: SugarElement<Node>) => U,
    on: (element: SugarElement<Node>, offset: number) => U,
    after: (element: SugarElement<Node>) => U
  ) => U;
  match: <U> (branches: {
    before: (element: SugarElement<Node>) => U;
    on: (element: SugarElement<Node>, offset: number) => U;
    after: (element: SugarElement<Node>) => U;
  }) => U;
  log: (label: string) => void;
}

const adt: {
  before: (element: SugarElement<Node>) => Situ;
  on: (element: SugarElement<Node>, offset: number) => Situ;
  after: (element: SugarElement<Node>) => Situ;
} = Adt.generate([
  { before: [ 'element' ] },
  { on: [ 'element', 'offset' ] },
  { after: [ 'element' ] }
]);

// Probably don't need this given that we now have "match"
const cata = <U> (subject: Situ, onBefore: (element: SugarElement<Node>) => U, onOn: (element: SugarElement<Node>, offset: number) => U, onAfter: (element: SugarElement<Node>) => U): U =>
  subject.fold(onBefore, onOn, onAfter);

const getStart = (situ: Situ): SugarElement<Node> =>
  situ.fold(Fun.identity, Fun.identity, Fun.identity);

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
