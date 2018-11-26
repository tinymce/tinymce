/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Options, Struct } from '@ephox/katamari';
import { Compare, Element, Traverse } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import DeleteUtils from './DeleteUtils';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';

const BlockPosition = Struct.immutable('block', 'position');
const BlockBoundary = Struct.immutable('from', 'to');

const getBlockPosition = function (rootNode, pos) {
  const rootElm = Element.fromDom(rootNode);
  const containerElm = Element.fromDom(pos.container());
  return DeleteUtils.getParentBlock(rootElm, containerElm).map(function (block) {
    return BlockPosition(block, pos);
  });
};

const isDifferentBlocks = function (blockBoundary) {
  return Compare.eq(blockBoundary.from().block(), blockBoundary.to().block()) === false;
};

const hasSameParent = function (blockBoundary) {
  return Traverse.parent(blockBoundary.from().block()).bind(function (parent1) {
    return Traverse.parent(blockBoundary.to().block()).filter(function (parent2) {
      return Compare.eq(parent1, parent2);
    });
  }).isSome();
};

const isEditable = function (blockBoundary) {
  return NodeType.isContentEditableFalse(blockBoundary.from().block()) === false && NodeType.isContentEditableFalse(blockBoundary.to().block()) === false;
};

const skipLastBr = function (rootNode, forward, blockPosition) {
  if (NodeType.isBr(blockPosition.position().getNode()) && Empty.isEmpty(blockPosition.block()) === false) {
    return CaretFinder.positionIn(false, blockPosition.block().dom()).bind(function (lastPositionInBlock) {
      if (lastPositionInBlock.isEqual(blockPosition.position())) {
        return CaretFinder.fromPosition(forward, rootNode, lastPositionInBlock).bind(function (to) {
          return getBlockPosition(rootNode, to);
        });
      } else {
        return Option.some(blockPosition);
      }
    }).getOr(blockPosition);
  } else {
    return blockPosition;
  }
};

const readFromRange = function (rootNode, forward, rng) {
  const fromBlockPos = getBlockPosition(rootNode, CaretPosition.fromRangeStart(rng));
  const toBlockPos = fromBlockPos.bind(function (blockPos) {
    return CaretFinder.fromPosition(forward, rootNode, blockPos.position()).bind(function (to) {
      return getBlockPosition(rootNode, to).map(function (blockPos) {
        return skipLastBr(rootNode, forward, blockPos);
      });
    });
  });

  return Options.liftN([fromBlockPos, toBlockPos], BlockBoundary).filter(function (blockBoundary) {
    return isDifferentBlocks(blockBoundary) && hasSameParent(blockBoundary) && isEditable(blockBoundary);
  });
};

const read = function (rootNode, forward, rng) {
  return rng.collapsed ? readFromRange(rootNode, forward, rng) : Option.none();
};

export default {
  read
};