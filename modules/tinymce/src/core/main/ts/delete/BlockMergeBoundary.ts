/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Optionals } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as DeleteUtils from './DeleteUtils';

export interface BlockPosition {
  readonly block: SugarElement<Element>;
  readonly position: CaretPosition;
}

export interface BlockBoundary {
  readonly from: BlockPosition;
  readonly to: BlockPosition;
}

const blockPosition = (block: SugarElement<Element>, position: CaretPosition): BlockPosition => ({
  block,
  position
});

const blockBoundary = (from: BlockPosition, to: BlockPosition): BlockBoundary => ({
  from,
  to
});

const getBlockPosition = (rootNode: Node, pos: CaretPosition): Optional<BlockPosition> => {
  const rootElm = SugarElement.fromDom(rootNode);
  const containerElm = SugarElement.fromDom(pos.container());
  return DeleteUtils.getParentBlock(rootElm, containerElm).map((block) => blockPosition(block, pos));
};

const isDifferentBlocks = (blockBoundary: BlockBoundary): boolean =>
  Compare.eq(blockBoundary.from.block, blockBoundary.to.block) === false;

const hasSameParent = (blockBoundary: BlockBoundary): boolean =>
  Traverse.parent(blockBoundary.from.block).bind((parent1) =>
    Traverse.parent(blockBoundary.to.block).filter((parent2) => Compare.eq(parent1, parent2))
  ).isSome();

const isEditable = (blockBoundary: BlockBoundary): boolean =>
  NodeType.isContentEditableFalse(blockBoundary.from.block.dom) === false && NodeType.isContentEditableFalse(blockBoundary.to.block.dom) === false;

const skipLastBr = (rootNode: Node, forward: boolean, blockPosition: BlockPosition): BlockPosition => {
  if (NodeType.isBr(blockPosition.position.getNode()) && Empty.isEmpty(blockPosition.block) === false) {
    return CaretFinder.positionIn(false, blockPosition.block.dom).bind((lastPositionInBlock) => {
      if (lastPositionInBlock.isEqual(blockPosition.position)) {
        return CaretFinder.fromPosition(forward, rootNode, lastPositionInBlock).bind((to) => getBlockPosition(rootNode, to));
      } else {
        return Optional.some(blockPosition);
      }
    }).getOr(blockPosition);
  } else {
    return blockPosition;
  }
};

const readFromRange = (rootNode: Node, forward: boolean, rng: Range): Optional<BlockBoundary> => {
  const fromBlockPos = getBlockPosition(rootNode, CaretPosition.fromRangeStart(rng));
  const toBlockPos = fromBlockPos.bind((blockPos) =>
    CaretFinder.fromPosition(forward, rootNode, blockPos.position).bind((to) =>
      getBlockPosition(rootNode, to).map((blockPos) => skipLastBr(rootNode, forward, blockPos))
    )
  );

  return Optionals.lift2(fromBlockPos, toBlockPos, blockBoundary).filter((blockBoundary) =>
    isDifferentBlocks(blockBoundary) && hasSameParent(blockBoundary) && isEditable(blockBoundary));
};

const read = (rootNode: Node, forward: boolean, rng: Range): Optional<BlockBoundary> =>
  rng.collapsed ? readFromRange(rootNode, forward, rng) : Optional.none();

export {
  read
};
