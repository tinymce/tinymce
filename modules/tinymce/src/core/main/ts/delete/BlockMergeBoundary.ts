import { Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as TransparentElements from '../content/TransparentElements';
import * as ElementType from '../dom/ElementType';
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

const getBlockPosition = (rootNode: HTMLElement, pos: CaretPosition): Optional<BlockPosition> => {
  const rootElm = SugarElement.fromDom(rootNode);
  const containerElm = SugarElement.fromDom(pos.container());
  return DeleteUtils.getParentBlock(rootElm, containerElm).map((block) => blockPosition(block, pos));
};

const isDifferentBlocks = (blockBoundary: BlockBoundary): boolean =>
  !Compare.eq(blockBoundary.from.block, blockBoundary.to.block);

const getClosestHost = (root: SugarElement<HTMLElement>, scope: SugarElement<Element>): SugarElement<HTMLElement> => {
  const isRoot = (node: SugarElement<Node>) => Compare.eq(node, root);
  const isHost = (node: SugarElement<Node>): node is SugarElement<HTMLElement> => ElementType.isTableCell(node) || NodeType.isContentEditableTrue(node.dom);
  return PredicateFind.closest(scope, isHost, isRoot).filter(SugarNode.isElement).getOr(root);
};

const hasSameHost = (rootNode: HTMLElement, blockBoundary: BlockBoundary): boolean => {
  const root = SugarElement.fromDom(rootNode);
  return Compare.eq(getClosestHost(root, blockBoundary.from.block), getClosestHost(root, blockBoundary.to.block));
};

const isEditable = (blockBoundary: BlockBoundary): boolean =>
  NodeType.isContentEditableFalse(blockBoundary.from.block.dom) === false && NodeType.isContentEditableFalse(blockBoundary.to.block.dom) === false;

const hasValidBlocks = (blockBoundary: BlockBoundary): boolean => {
  const isValidBlock = (block: SugarElement<Element>) => ElementType.isTextBlock(block) || TransparentElements.hasBlockAttr(block.dom);
  return isValidBlock(blockBoundary.from.block) && isValidBlock(blockBoundary.to.block);
};

const skipLastBr = (rootNode: HTMLElement, forward: boolean, blockPosition: BlockPosition): BlockPosition => {
  if (NodeType.isBr(blockPosition.position.getNode()) && !Empty.isEmpty(blockPosition.block)) {
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

const readFromRange = (rootNode: HTMLElement, forward: boolean, rng: Range): Optional<BlockBoundary> => {
  const fromBlockPos = getBlockPosition(rootNode, CaretPosition.fromRangeStart(rng));
  const toBlockPos = fromBlockPos.bind((blockPos) =>
    CaretFinder.fromPosition(forward, rootNode, blockPos.position).bind((to) =>
      getBlockPosition(rootNode, to).map((blockPos) => skipLastBr(rootNode, forward, blockPos))
    )
  );

  return Optionals.lift2(fromBlockPos, toBlockPos, blockBoundary).filter((blockBoundary) =>
    isDifferentBlocks(blockBoundary) && hasSameHost(rootNode, blockBoundary) && isEditable(blockBoundary) && hasValidBlocks(blockBoundary));
};

const read = (rootNode: HTMLElement, forward: boolean, rng: Range): Optional<BlockBoundary> =>
  rng.collapsed ? readFromRange(rootNode, forward, rng) : Optional.none();

export {
  read
};
