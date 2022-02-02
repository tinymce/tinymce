/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, Insert, Remove, SugarElement, Traverse } from '@ephox/sugar';

import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as PaddingBr from '../dom/PaddingBr';
import * as Parents from '../dom/Parents';

const getChildrenUntilBlockBoundary = (block: SugarElement<Element>): SugarElement<Node>[] => {
  const children = Traverse.children(block);
  return Arr.findIndex(children, ElementType.isBlock).fold(
    Fun.constant(children),
    (index) => children.slice(0, index)
  );
};

const extractChildren = (block: SugarElement<Element>): SugarElement<Node>[] => {
  const children = getChildrenUntilBlockBoundary(block);
  Arr.each(children, Remove.remove);
  return children;
};

const removeEmptyRoot = (rootNode: SugarElement<Node>, block: SugarElement<Element>) => {
  const parents = Parents.parentsAndSelf(block, rootNode);
  return Arr.find(parents.reverse(), (element) => Empty.isEmpty(element)).each(Remove.remove);
};

const isEmptyBefore = (el: SugarElement<Node>): boolean =>
  Arr.filter(Traverse.prevSiblings(el), (el) => !Empty.isEmpty(el)).length === 0;

const nestedBlockMerge = (
  rootNode: SugarElement<Node>,
  fromBlock: SugarElement<Element>,
  toBlock: SugarElement<Element>,
  insertionPoint: SugarElement<Node>
): Optional<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    PaddingBr.fillWithPaddingBr(toBlock);
    return CaretFinder.firstPositionIn(toBlock.dom);
  }

  if (isEmptyBefore(insertionPoint) && Empty.isEmpty(fromBlock)) {
    Insert.before(insertionPoint, SugarElement.fromTag('br'));
  }

  const position = CaretFinder.prevPosition(toBlock.dom, CaretPosition.before(insertionPoint.dom));
  Arr.each(extractChildren(fromBlock), (child) => {
    Insert.before(insertionPoint, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const sidelongBlockMerge = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>): Optional<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    Remove.remove(toBlock);
    if (Empty.isEmpty(fromBlock)) {
      PaddingBr.fillWithPaddingBr(fromBlock);
    }
    return CaretFinder.firstPositionIn(fromBlock.dom);
  }

  const position = CaretFinder.lastPositionIn(toBlock.dom);
  Arr.each(extractChildren(fromBlock), (child) => {
    Insert.append(toBlock, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const findInsertionPoint = (toBlock: SugarElement<Element>, block: SugarElement<Element>) => {
  const parentsAndSelf = Parents.parentsAndSelf(block, toBlock);
  return Optional.from(parentsAndSelf[parentsAndSelf.length - 1]);
};

const getInsertionPoint = (fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>): Optional<SugarElement> =>
  Compare.contains(toBlock, fromBlock) ? findInsertionPoint(toBlock, fromBlock) : Optional.none();

const trimBr = (first: boolean, block: SugarElement) => {
  CaretFinder.positionIn(first, block.dom)
    .map((position) => position.getNode())
    .map(SugarElement.fromDom)
    .filter(ElementType.isBr)
    .each(Remove.remove);
};

const mergeBlockInto = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>): Optional<CaretPosition> => {
  trimBr(true, fromBlock);
  trimBr(false, toBlock);

  return getInsertionPoint(fromBlock, toBlock).fold(
    Fun.curry(sidelongBlockMerge, rootNode, fromBlock, toBlock),
    Fun.curry(nestedBlockMerge, rootNode, fromBlock, toBlock)
  );
};

const mergeBlocks = (rootNode: SugarElement<Node>, forward: boolean, block1: SugarElement<Element>, block2: SugarElement<Element>): Optional<CaretPosition> =>
  forward ? mergeBlockInto(rootNode, block2, block1) : mergeBlockInto(rootNode, block1, block2);

export {
  mergeBlocks
};
