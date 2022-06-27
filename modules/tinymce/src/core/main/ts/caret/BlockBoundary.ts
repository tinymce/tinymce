import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';

import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { isEmptyText } from './CaretPositionPredicates';
import { isInSameBlock } from './CaretUtils';

const navigateIgnoreEmptyTextNodes = (forward: boolean, root: Node, from: CaretPosition): Optional<CaretPosition> =>
  CaretFinder.navigateIgnore(forward, root, from, isEmptyText);

const getClosestBlock = (root: SugarElement<Node>, pos: CaretPosition): Optional<SugarElement<Element>> =>
  Arr.find(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), ElementType.isBlock);

const isAtBeforeAfterBlockBoundary = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition) =>
  navigateIgnoreEmptyTextNodes(forward, root.dom, pos)
    .forall((newPos) => getClosestBlock(root, pos).fold(
      () => !isInSameBlock(newPos, pos, root.dom),
      (fromBlock) => !isInSameBlock(newPos, pos, root.dom) && Compare.contains(fromBlock, SugarElement.fromDom(newPos.container()))
    ));

const isAtBlockBoundary = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition) => getClosestBlock(root, pos).fold(
  () => navigateIgnoreEmptyTextNodes(forward, root.dom, pos).forall((newPos) => !isInSameBlock(newPos, pos, root.dom)),
  (parent) => navigateIgnoreEmptyTextNodes(forward, parent.dom, pos).isNone()
);

const isAtStartOfBlock = Fun.curry(isAtBlockBoundary, false);
const isAtEndOfBlock = Fun.curry(isAtBlockBoundary, true);
const isBeforeBlock = Fun.curry(isAtBeforeAfterBlockBoundary, false);
const isAfterBlock = Fun.curry(isAtBeforeAfterBlockBoundary, true);

export {
  isAtStartOfBlock,
  isAtEndOfBlock,
  isBeforeBlock,
  isAfterBlock
};
