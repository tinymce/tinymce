import { Fun, Optional } from '@ephox/katamari';

import * as NodeType from '../dom/NodeType';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';

const walkToPositionIn = (forward: boolean, root: Node, start: Node): Optional<CaretPosition> => {
  const position = forward ? CaretPosition.before(start) : CaretPosition.after(start);
  return fromPosition(forward, root, position);
};

const afterElement = (node: Node): CaretPosition =>
  NodeType.isBr(node) ? CaretPosition.before(node) : CaretPosition.after(node);

const isBeforeOrStart = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    return position.offset() === 0;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode());
  }
};

const isAfterOrEnd = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    const container = position.container() as Text;
    return position.offset() === container.data.length;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode(true));
  }
};

const isBeforeAfterSameElement = (from: CaretPosition, to: CaretPosition): boolean =>
  !CaretPosition.isTextPosition(from) && !CaretPosition.isTextPosition(to) && from.getNode() === to.getNode(true);

const isAtBr = (position: CaretPosition): boolean =>
  !CaretPosition.isTextPosition(position) && NodeType.isBr(position.getNode());

const shouldSkipPosition = (forward: boolean, from: CaretPosition, to: CaretPosition): boolean => {
  if (forward) {
    return !isBeforeAfterSameElement(from, to) && !isAtBr(from) && isAfterOrEnd(from) && isBeforeOrStart(to);
  } else {
    return !isBeforeAfterSameElement(to, from) && isBeforeOrStart(from) && isAfterOrEnd(to);
  }
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>|b</b></p>
const fromPosition = (forward: boolean, root: Node, pos: CaretPosition): Optional<CaretPosition> => {
  const walker = CaretWalker(root);
  return Optional.from(forward ? walker.next(pos) : walker.prev(pos));
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>b|</b></p>
const navigate = (forward: boolean, root: Node, from: CaretPosition): Optional<CaretPosition> =>
  fromPosition(forward, root, from).bind((to) => {
    if (CaretUtils.isInSameBlock(from, to, root) && shouldSkipPosition(forward, from, to)) {
      return fromPosition(forward, root, to);
    } else {
      return Optional.some(to);
    }
  });

const navigateIgnore = (
  forward: boolean,
  root: Node,
  from: CaretPosition,
  ignoreFilter: (pos: CaretPosition) => boolean
): Optional<CaretPosition> => navigate(forward, root, from)
  .bind((pos) => ignoreFilter(pos) ? navigateIgnore(forward, root, pos, ignoreFilter) : Optional.some(pos));

const positionIn = (forward: boolean, element: Node): Optional<CaretPosition> => {
  const startNode = forward ? element.firstChild : element.lastChild;
  if (NodeType.isText(startNode)) {
    return Optional.some(CaretPosition(startNode, forward ? 0 : startNode.data.length));
  } else if (startNode) {
    if (CaretCandidate.isCaretCandidate(startNode)) {
      return Optional.some(forward ? CaretPosition.before(startNode) : afterElement(startNode));
    } else {
      return walkToPositionIn(forward, element, startNode);
    }
  } else {
    return Optional.none();
  }
};

const nextPosition: (root: Node, pos: CaretPosition) => Optional<CaretPosition> = Fun.curry(fromPosition, true);
const prevPosition: (root: Node, pos: CaretPosition) => Optional<CaretPosition> = Fun.curry(fromPosition, false);

const firstPositionIn: (element: Node) => Optional<CaretPosition> = Fun.curry(positionIn, true);
const lastPositionIn: (element: Node) => Optional<CaretPosition> = Fun.curry(positionIn, false);

export {
  fromPosition,
  nextPosition,
  prevPosition,
  navigate,
  navigateIgnore,
  positionIn,
  firstPositionIn,
  lastPositionIn
};
