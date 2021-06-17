import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SpotPoint } from '../api/data/Types';
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
const typed = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean): TypedItem<E, D>[] => {
  if (universe.property().isText(item)) {
    return [ TypedItem.text(item, universe) ];
  } else if (universe.property().isEmptyTag(item)) {
    return [ TypedItem.empty(item, universe) ];
  } else if (universe.property().isNonEditable(item)) {
    return []; // Do not include this at all
  } else if (universe.property().isElement(item)) {
    const children = universe.property().children(item);
    const boundary = universe.property().isBoundary(item) ? [ TypedItem.boundary(item, universe) ] : [];
    const rest = optimise !== undefined && optimise(item) ? [] : Arr.bind(children, (child) => {
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
const items = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean): E[] => {
  const typedItemList = typed(universe, item, optimise);

  const raw = (item: E, _universe: Universe<E, D>) => {
    return item;
  };

  return Arr.map(typedItemList, (typedItem: TypedItem<E, D>) => {
    return typedItem.fold(raw, raw, raw, raw);
  });
};

const extractToElem = <E, D>(universe: Universe<E, D>, child: E, offset: number, item: E, optimise?: (e: E) => boolean): SpotPoint<E> => {
  const extractions = typed(universe, item, optimise);
  const prior = TypedList.dropUntil(extractions, child);
  const count = TypedList.count(prior);
  return Spot.point(item, count + offset);
};

/**
 * Generates an absolute point in the child's parent
 * that can be used to reference the offset into child later.
 *
 * To find the exact reference later, use Find.
 */
const extract = <E, D>(universe: Universe<E, D>, child: E, offset: number, optimise?: (e: E) => boolean): SpotPoint<E> => {
  return universe.property().parent(child).fold(() => {
    return Spot.point(child, offset);
  }, (parent) => {
    return extractToElem(universe, child, offset, parent, optimise);
  });
};

/**
 * Generates an absolute point that can be used to reference the offset into child later.
 * This absolute point will be relative to a parent node (specified by predicate).
 *
 * To find the exact reference later, use Find.
 */
const extractTo = <E, D>(universe: Universe<E, D>, child: E, offset: number, pred: (e: E) => boolean, optimise?: (e: E) => boolean): SpotPoint<E> => {
  return universe.up().predicate(child, pred).fold(() => {
    return Spot.point(child, offset);
  }, (v) => {
    return extractToElem(universe, child, offset, v, optimise);
  });
};

export {
  typed,
  items,
  extractTo,
  extract
};
