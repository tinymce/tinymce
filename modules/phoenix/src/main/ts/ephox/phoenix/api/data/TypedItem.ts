import { Universe } from '@ephox/boss';
import { Adt, Fun, Optional } from '@ephox/katamari';

type Handler<E, D, U> = (item: E, universe: Universe<E, D>) => U;

interface TypedItemAdt<E, D> {
  fold: <U> (
    onBoundary: Handler<E, D, U>,
    onEmpty: Handler<E, D, U>,
    onText: Handler<E, D, U>,
    onNonEditable: Handler<E, D, U>
  ) => U;
  match: <U> (branches: {
    boundary: Handler<E, D, U>;
    empty: Handler<E, D, U>;
    text: Handler<E, D, U>;
    nonEditable: Handler<E, D, U>;
  }) => U;
  log: (label: string) => void;
}

export interface TypedItem<E, D> extends TypedItemAdt<E, D> {
  isBoundary(): boolean;
  toText(): Optional<E>;
  is(other: E): boolean;
  len(): number;
}

type TypedItemAdtConstructor = <E, D>(item: E, universe: Universe<E, D>) => TypedItemAdt<E, D>;

const adt: {
  boundary: TypedItemAdtConstructor;
  empty: TypedItemAdtConstructor;
  text: TypedItemAdtConstructor;
  nonEditable: TypedItemAdtConstructor;
} = Adt.generate([
  { boundary: [ 'item', 'universe' ] },
  { empty: [ 'item', 'universe' ] },
  { text: [ 'item', 'universe' ] },
  { nonEditable: [ 'item', 'universe' ] }
]);

const no = Fun.never;
const yes = Fun.always;
const zero = Fun.constant(0);
const one = Fun.constant(1);

const ext = <E, D>(ti: TypedItemAdt<E, D>): TypedItem<E, D> => ({
  ...ti,
  isBoundary: () => ti.fold(yes, no, no, no),
  toText: () => ti.fold<Optional<E>>(Optional.none, Optional.none, (i) => Optional.some(i), Optional.none),
  is: (other) => ti.fold(no, no, (i, u) => u.eq(i, other), no),
  len: () => ti.fold(zero, one, (i, u) => u.property().getText(i).length, one)
});

type TypedItemConstructor = <E, D>(item: E, universe: Universe<E, D>) => TypedItem<E, D>;

// currently Fun.compose does not create the correct output type for functions with generic types
const text = Fun.compose(ext as any, adt.text as any) as TypedItemConstructor;
const boundary = Fun.compose(ext as any, adt.boundary as any) as TypedItemConstructor;
const empty = Fun.compose(ext as any, adt.empty as any) as TypedItemConstructor;
const nonEditable = Fun.compose(ext as any, adt.empty as any) as TypedItemConstructor;

const cata = <E, D, U>(subject: TypedItem<E, D>, onBoundary: Handler<E, D, U>, onEmpty: Handler<E, D, U>, onText: Handler<E, D, U>, onNonEditable: Handler<E, D, U>): U => {
  return subject.fold(onBoundary, onEmpty, onText, onNonEditable);
};

export const TypedItem = {
  text,
  boundary,
  empty,
  nonEditable,
  cata
};
