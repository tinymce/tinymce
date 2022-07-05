import { Adt, Fun, Optional, Optionals } from '@ephox/katamari';

import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import { getParentCaretContainer } from '../fmt/FormatContainer';
import * as LazyEvaluator from '../util/LazyEvaluator';
import * as InlineUtils from './InlineUtils';

export interface LocationAdt {
  fold: <T> (
    before: (element: Element) => T,
    start: (element: Element) => T,
    end: (element: Element) => T,
    after: (element: Element) => T
  ) => T;
  match: <T> (branches: {
    before: (element: Element) => T;
    start: (element: Element) => T;
    end: (element: Element) => T;
    after: (element: Element) => T;
  }) => T;
  log: (label: string) => void;
}

const Location = Adt.generate([
  { before: [ 'element' ] },
  { start: [ 'element' ] },
  { end: [ 'element' ] },
  { after: [ 'element' ] }
]);

const rescope = (rootNode: Node, node: Node) => {
  const parentBlock = CaretUtils.getParentBlock(node, rootNode);
  return parentBlock ? parentBlock : rootNode;
};

const before = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeForwards(pos);
  const scope = rescope(rootNode, nPos.container());
  return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
    () => CaretFinder.nextPosition(scope, nPos)
      .bind(Fun.curry(InlineUtils.findRootInline, isInlineTarget, scope))
      .map((inline) => Location.before(inline)),
    Optional.none
  );
};

const isNotInsideFormatCaretContainer = (rootNode: Node, elm: Node) =>
  getParentCaretContainer(rootNode, elm) === null;

const findInsideRootInline = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) =>
  InlineUtils.findRootInline(isInlineTarget, rootNode, pos).filter(Fun.curry(isNotInsideFormatCaretContainer, rootNode));

const start = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeBackwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind((inline) => {
    const prevPos = CaretFinder.prevPosition(inline, nPos);
    return prevPos.isNone() ? Optional.some(Location.start(inline)) : Optional.none();
  });
};

const end = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeForwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind((inline) => {
    const nextPos = CaretFinder.nextPosition(inline, nPos);
    return nextPos.isNone() ? Optional.some(Location.end(inline)) : Optional.none();
  });
};

const after = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeBackwards(pos);
  const scope = rescope(rootNode, nPos.container());
  return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
    () => CaretFinder.prevPosition(scope, nPos)
      .bind(Fun.curry(InlineUtils.findRootInline, isInlineTarget, scope))
      .map((inline) => Location.after(inline)),
    Optional.none
  );
};

const isValidLocation = (location: LocationAdt) => !InlineUtils.isRtl(getElement(location));

const readLocation = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition): Optional<LocationAdt> => {
  const location = LazyEvaluator.evaluateUntil([
    before,
    start,
    end,
    after
  ], [ isInlineTarget, rootNode, pos ]);

  return location.filter(isValidLocation);
};

const getElement = (location: LocationAdt): Element => location.fold(
  Fun.identity, // Before
  Fun.identity, // Start
  Fun.identity, // End
  Fun.identity  // After
);

const getName = (location: LocationAdt): string => location.fold(
  Fun.constant('before'), // Before
  Fun.constant('start'),  // Start
  Fun.constant('end'),    // End
  Fun.constant('after')   // After
);

const outside = (location: LocationAdt): LocationAdt => location.fold(
  Location.before, // Before
  Location.before, // Start
  Location.after,  // End
  Location.after   // After
);

const inside = (location: LocationAdt): LocationAdt => location.fold(
  Location.start, // Before
  Location.start, // Start
  Location.end,   // End
  Location.end    // After
);

const isEq = (location1: LocationAdt, location2: LocationAdt) =>
  getName(location1) === getName(location2) && getElement(location1) === getElement(location2);

const betweenInlines = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, from: CaretPosition, to: CaretPosition, location: LocationAdt) =>
  Optionals.lift2(
    InlineUtils.findRootInline(isInlineTarget, rootNode, from),
    InlineUtils.findRootInline(isInlineTarget, rootNode, to),
    (fromInline, toInline) => {
      if (fromInline !== toInline && InlineUtils.hasSameParentBlock(rootNode, fromInline, toInline)) {
        // Force after since some browsers normalize and lean left into the closest inline
        return Location.after(forward ? fromInline : toInline);
      } else {
        return location;
      }
    }).getOr(location);

const skipNoMovement = (fromLocation: Optional<LocationAdt>, toLocation: LocationAdt) => fromLocation.fold(
  Fun.always,
  (fromLocation) => !isEq(fromLocation, toLocation)
);

const findLocationTraverse = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, fromLocation: Optional<LocationAdt>, pos: CaretPosition): Optional<LocationAdt> => {
  const from = InlineUtils.normalizePosition(forward, pos);
  const to = CaretFinder.fromPosition(forward, rootNode, from).map(Fun.curry(InlineUtils.normalizePosition, forward));

  const location = to.fold(
    () => fromLocation.map(outside),
    (to) => readLocation(isInlineTarget, rootNode, to)
      .map(Fun.curry(betweenInlines, forward, isInlineTarget, rootNode, from, to))
      .filter(Fun.curry(skipNoMovement, fromLocation))
  );

  return location.filter(isValidLocation);
};

const findLocationSimple = (forward: boolean, location: LocationAdt): Optional<LocationAdt> => {
  if (forward) {
    return location.fold<Optional<LocationAdt>>(
      Fun.compose(Optional.some, Location.start), // Before -> Start
      Optional.none,
      Fun.compose(Optional.some, Location.after), // End -> After
      Optional.none
    );
  } else {
    return location.fold<Optional<LocationAdt>>(
      Optional.none,
      Fun.compose(Optional.some, Location.before), // Before <- Start
      Optional.none,
      Fun.compose(Optional.some, Location.end) // End <- After
    );
  }
};

const findLocation = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition): Optional<LocationAdt> => {
  const from = InlineUtils.normalizePosition(forward, pos);
  const fromLocation = readLocation(isInlineTarget, rootNode, from);

  return readLocation(isInlineTarget, rootNode, from).bind(Fun.curry(findLocationSimple, forward))
    .orThunk(() => findLocationTraverse(forward, isInlineTarget, rootNode, fromLocation, pos));
};

const prevLocation = Fun.curry(findLocation, false);
const nextLocation = Fun.curry(findLocation, true);

export {
  readLocation,
  findLocation,
  prevLocation,
  nextLocation,
  getElement,
  outside,
  inside
};
