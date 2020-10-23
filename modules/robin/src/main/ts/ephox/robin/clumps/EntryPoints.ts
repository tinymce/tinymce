import { Universe } from '@ephox/boss';
import { Adt } from '@ephox/katamari';
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
  leftEdge: <E> (element: E) => EntryPoint<E>;
  between: <E> (before: E, after: E) => EntryPoint<E>;
  rightEdge: <E> (element: E) => EntryPoint<E>;
} = Adt.generate([
  { leftEdge: [ 'element' ] },
  { between: [ 'before', 'after' ] },
  { rightEdge: [ 'element' ] }
]);

const onText = function <E, D> (universe: Universe<E, D>, element: E, offset: number) {
  const raw = Split.split(universe, element, offset);
  const positions = Split.position(universe, raw);
  // Note, these cannot be curried because then more arguments are supplied than the adt expects.
  const l = function () { return adt.leftEdge(element); };
  const r = function () { return adt.rightEdge(element); };
  // None, Start, Middle, End
  return positions.fold(r, l, adt.between, r);
};

const onElement = function <E, D> (universe: Universe<E, D>, element: E, offset: number) {
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

const analyse = function <E, D> (universe: Universe<E, D>, element: E, offset: number, fallback: (element: E) => EntryPoint<E>) {
  if (universe.property().isText(element)) {
    return onText(universe, element, offset);
  } else if (universe.property().isEmptyTag(element)) {
    return fallback(element);
  } else {
    return onElement(universe, element, offset);
  }
};

// When breaking to the left, we will want to include the 'right' section of the split.
const toLeft = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, offset: number) {
  return analyse(universe, element, offset, adt.leftEdge).fold(function (e) {
    // We are at the left edge of the element, so take the whole element
    return e;
  }, function (b, a) {
    // We are splitting an element, so take the right side
    return a;
  }, function (e) {
    // We are at the right edge of the starting element, so gather the next element to the
    // right.
    return Gather.after(universe, e, isRoot).getOr(e);
  });
};

// When breaking to the right, we will want to include the 'left' section of the split.
const toRight = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, offset: number) {
  return analyse(universe, element, offset, adt.rightEdge).fold(function (e) {
    // We are at the left edge of the finishing element, so gather the previous element.
    return Gather.before(universe, e, isRoot).getOr(e);
  }, function (b, _a) {
    // We are splitting an element, so take the left side.
    return b;
  }, function (e) {
    // We are the right edge of the element, so take the whole element
    return e;
  });
};

export {
  toLeft,
  toRight
};
