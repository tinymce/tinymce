import { Universe } from '@ephox/boss';
import { Adt, Fun } from '@ephox/katamari';
import { Gather, Split } from '@ephox/phoenix';

interface EntryPoint<E> {
  fold: <T> (
    leftEdge: (element: E) => T,
    between: (before: E, after: E) => T,
    rightEdge: (element: E) => T
  ) => T;
  match: <T> (branches: {
    leftEdge: (element: E) => T;
    between: (before: E, after: E) => T;
    rightEdge: (element: E) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  leftEdge: <E>(element: E) => EntryPoint<E>;
  between: <E>(before: E, after: E) => EntryPoint<E>;
  rightEdge: <E>(element: E) => EntryPoint<E>;
} = Adt.generate([
  { leftEdge: [ 'element' ] },
  { between: [ 'before', 'after' ] },
  { rightEdge: [ 'element' ] }
]);

const onText = <E, D>(universe: Universe<E, D>, element: E, offset: number): EntryPoint<E> => {
  const raw = Split.split(universe, element, offset);
  const positions = Split.position(universe, raw);
  // Note, these cannot be curried because then more arguments are supplied than the adt expects.
  const l = () => adt.leftEdge(element);
  const r = () => adt.rightEdge(element);
  // None, Start, Middle, End
  return positions.fold(r, l, adt.between, r);
};

const onElement = <E, D>(universe: Universe<E, D>, element: E, offset: number): EntryPoint<E> => {
  const children = universe.property().children(element);
  if (offset === 0) {
    return adt.leftEdge(element);
  } else if (offset === children.length) {
    return adt.rightEdge(element);
  } else if (offset > 0 && offset < children.length) {
    return adt.between(children[offset - 1], children[offset]);
  } else {
    // NOTE: This should not happen.
    return adt.rightEdge(element);
  }
};

const analyse = <E, D>(universe: Universe<E, D>, element: E, offset: number, fallback: (element: E) => EntryPoint<E>): EntryPoint<E> => {
  if (universe.property().isText(element)) {
    return onText(universe, element, offset);
  } else if (universe.property().isEmptyTag(element)) {
    return fallback(element);
  } else {
    return onElement(universe, element, offset);
  }
};

// When breaking to the left, we will want to include the 'right' section of the split.
const toLeft = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, offset: number): E => {
  return analyse(universe, element, offset, adt.leftEdge).fold(
    // We are at the left edge of the element, so take the whole element
    Fun.identity,
    // We are splitting an element, so take the right side
    (b, a) => a,
    // We are at the right edge of the starting element, so gather the next element to the right
    (e) => Gather.after(universe, e, isRoot).getOr(e)
  );
};

// When breaking to the right, we will want to include the 'left' section of the split.
const toRight = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, offset: number): E => {
  return analyse(universe, element, offset, adt.rightEdge).fold(
    // We are at the left edge of the finishing element, so gather the previous element.
    (e) => Gather.before(universe, e, isRoot).getOr(e),
    // We are splitting an element, so take the left side.
    (b, _a) => b,
    // We are the right edge of the element, so take the whole element
    Fun.identity
  );
};

export {
  toLeft,
  toRight
};
