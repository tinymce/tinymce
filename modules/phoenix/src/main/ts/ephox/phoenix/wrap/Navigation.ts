import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Spot from '../api/data/Spot';
import { SpotPoint } from '../api/data/Types';

/**
 * Return the last available cursor position in the node.
 */
const toLast = function <E, D>(universe: Universe<E, D>, node: E): SpotPoint<E> {
  if (universe.property().isText(node)) {
    return Spot.point(node, universe.property().getText(node).length);
  } else {
    const children = universe.property().children(node);
    // keep descending if there are children.
    return children.length > 0 ? toLast(universe, children[children.length - 1]) : Spot.point(node, children.length);
  }
};

const toLower = function <E, D>(universe: Universe<E, D>, node: E) {
  const lastOffset = universe.property().isText(node) ?
    universe.property().getText(node).length :
    universe.property().children(node).length;
  return Spot.point(node, lastOffset);
};

/**
 * Descend down to a leaf node at the given offset.
 */
const toLeaf = function <E, D>(universe: Universe<E, D>, element: E, offset: number): SpotPoint<E> {
  const children = universe.property().children(element);
  if (children.length > 0 && offset < children.length) {
    return toLeaf(universe, children[offset], 0);
  } else if (children.length > 0 && universe.property().isElement(element) && children.length === offset) {
    return toLast(universe, children[children.length - 1]);
  } else {
    return Spot.point(element, offset);
  }
};

const scan = function <E, D>(universe: Universe<E, D>, element: E, direction: (e: E) => Option<E>): Option<E> {
  // if a comment or zero-length text, scan the siblings
  if ((universe.property().isText(element) && universe.property().getText(element).trim().length === 0)
    || universe.property().isComment(element)) {
    return direction(element).bind(function (elem) {
      return scan(universe, elem, direction).orThunk(function () {
        return Option.some(elem);
      });
    });
  } else {
    return Option.none();
  }
};

const freefallLtr = function <E, D>(universe: Universe<E, D>, element: E): SpotPoint<E> {
  const candidate = scan(universe, element, universe.query().nextSibling).getOr(element);
  if (universe.property().isText(candidate)) { return Spot.point(candidate, 0); }
  const children = universe.property().children(candidate);
  return children.length > 0 ? freefallLtr(universe, children[0]) : Spot.point(candidate, 0);
};

const toEnd = function <E, D>(universe: Universe<E, D>, element: E) {
  if (universe.property().isText(element)) { return universe.property().getText(element).length; }
  const children = universe.property().children(element);
  return children.length;
};

const freefallRtl = function <E, D>(universe: Universe<E, D>, element: E): SpotPoint<E> {
  const candidate = scan(universe, element, universe.query().prevSibling).getOr(element);
  if (universe.property().isText(candidate)) { return Spot.point(candidate, toEnd(universe, candidate)); }
  const children = universe.property().children(candidate);
  return children.length > 0 ? freefallRtl(universe, children[children.length - 1]) : Spot.point(candidate, toEnd(universe, candidate));
};

export {
  toLast,
  toLeaf,
  toLower,
  freefallLtr,
  freefallRtl
};