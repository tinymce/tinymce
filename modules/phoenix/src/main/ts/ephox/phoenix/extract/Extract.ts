import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import * as TypedList from './TypedList';

/**
 * Flattens the item tree into an array of TypedItem representations.
 *
 * Boundaries are returned twice, before and after their children.
 *
 * Returns: [array of TypedItem] where:
 *  If item is a text node or empty tag, returns a single-element array [item]
 *  If item is an element, returns all children recursively as an array.
 *  - if the element is also boundary, item is added to the front and end of the return array.
 *  Otherwise returns []
 * TODO: for TBIO-470 for Multi-Language spell checking: deal with the element LANG, adding language to typeditem so this nested information is not lost
 */
var typed = function <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean): TypedItem<E, D>[] {
  if (universe.property().isText(item)) {
    return [TypedItem.text(item, universe)];
  } else if (universe.property().isEmptyTag(item)) {
    return [TypedItem.empty(item, universe)];
  } else if (universe.property().isElement(item)) {
    var children = universe.property().children(item);
    var boundary = universe.property().isBoundary(item) ? [TypedItem.boundary(item, universe)] : [];
    var rest = optimise !== undefined && optimise(item) ? [] : Arr.bind(children, function (child) {
      return typed(universe, child, optimise);
    });
    return boundary.concat(rest).concat(boundary);
  } else {
    return [];
  }
};

/**
 * Returns just the actual elements from a call to typed().
 */
var items = function <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) {
  var typedItemList = typed(universe, item, optimise);

  var raw = function (item: E, _universe: Universe<E, D>) { return item; };

  return Arr.map(typedItemList, function (typedItem: TypedItem<E, D>) {
    return typedItem.fold(raw, raw, raw);
  });
};

var extractToElem = function <E, D>(universe: Universe<E, D>, child: E, offset: number, item: E, optimise?: (e: E) => boolean) {
  var extractions = typed(universe, item, optimise);
  var prior = TypedList.dropUntil(extractions, child);
  var count = TypedList.count(prior);
  return Spot.point(item, count + offset);
};

/**
 * Generates an absolute point in the child's parent
 * that can be used to reference the offset into child later.
 *
 * To find the exact reference later, use Find.
 */
var extract = function <E, D>(universe: Universe<E, D>, child: E, offset: number, optimise?: (e: E) => boolean) {
  return universe.property().parent(child).fold(function () {
    return Spot.point(child, offset);
  }, function (parent) {
    return extractToElem(universe, child, offset, parent, optimise);
  });
};

/**
 * Generates an absolute point that can be used to reference the offset into child later.
 * This absolute point will be relative to a parent node (specified by predicate).
 *
 * To find the exact reference later, use Find.
 */
var extractTo = function <E, D>(universe: Universe<E, D>, child: E, offset: number, pred: (e: E) => boolean, optimise?: (e: E) => boolean) {
  return universe.up().predicate(child, pred).fold(function () {
    return Spot.point(child, offset);
  }, function (v) {
    return extractToElem(universe, child, offset, v, optimise);
  });
};

export {
  typed,
  items,
  extractTo,
  extract
};