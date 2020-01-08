/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element, Insert, Remove, Traverse } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import Empty from '../dom/Empty';
import PaddingBr from '../dom/PaddingBr';
import Parents from '../dom/Parents';

const getChildrenUntilBlockBoundary = (block: Element) => {
  const children = Traverse.children(block);
  return Arr.findIndex(children, ElementType.isBlock).fold(
    () => children,
    (index) => children.slice(0, index)
  );
};

const extractChildren = (block: Element) => {
  const children = getChildrenUntilBlockBoundary(block);
  Arr.each(children, Remove.remove);
  return children;
};

const removeEmptyRoot = (rootNode: Element, block: Element) => {
  const parents = Parents.parentsAndSelf(block, rootNode);
  return Arr.find(parents.reverse(), (element) => Empty.isEmpty(element)).each(Remove.remove);
};

const isEmptyBefore = (el: Element) => Arr.filter(Traverse.prevSiblings(el), (el) => !Empty.isEmpty(el)).length === 0;

const nestedBlockMerge = (rootNode: Element, fromBlock: Element, toBlock: Element, insertionPoint: Element): Option<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    PaddingBr.fillWithPaddingBr(toBlock);
    return CaretFinder.firstPositionIn(toBlock.dom());
  }

  if (isEmptyBefore(insertionPoint) && Empty.isEmpty(fromBlock)) {
    Insert.before(insertionPoint, Element.fromTag('br'));
  }

  const position = CaretFinder.prevPosition(toBlock.dom(), CaretPosition.before(insertionPoint.dom()));
  Arr.each(extractChildren(fromBlock), (child) => {
    Insert.before(insertionPoint, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const sidelongBlockMerge = (rootNode: Element, fromBlock: Element, toBlock: Element): Option<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    Remove.remove(toBlock);
    if (Empty.isEmpty(fromBlock)) {
      PaddingBr.fillWithPaddingBr(fromBlock);
    }
    return CaretFinder.firstPositionIn(fromBlock.dom());
  }

  const position = CaretFinder.lastPositionIn(toBlock.dom());
  Arr.each(extractChildren(fromBlock), (child) => {
    Insert.append(toBlock, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const findInsertionPoint = (toBlock: Element, block: Element) => {
  const parentsAndSelf = Parents.parentsAndSelf(block, toBlock);
  return Option.from(parentsAndSelf[parentsAndSelf.length - 1]);
};

const getInsertionPoint = (fromBlock: Element, toBlock: Element): Option<Element> => {
  return Compare.contains(toBlock, fromBlock) ? findInsertionPoint(toBlock, fromBlock) : Option.none();
};

const trimBr = (first: boolean, block: Element) => {
  CaretFinder.positionIn(first, block.dom())
    .map((position) => position.getNode())
    .map(Element.fromDom)
    .filter(ElementType.isBr)
    .each(Remove.remove);
};

const mergeBlockInto = (rootNode: Element, fromBlock: Element, toBlock: Element): Option<CaretPosition> => {
  trimBr(true, fromBlock);
  trimBr(false, toBlock);

  return getInsertionPoint(fromBlock, toBlock).fold(
    Fun.curry(sidelongBlockMerge, rootNode, fromBlock, toBlock),
    Fun.curry(nestedBlockMerge, rootNode, fromBlock, toBlock)
  );
};

const mergeBlocks = (rootNode: Element, forward: boolean, block1: Element, block2: Element) => {
  return forward ? mergeBlockInto(rootNode, block2, block1) : mergeBlockInto(rootNode, block1, block2);
};

export default {
  mergeBlocks
};
