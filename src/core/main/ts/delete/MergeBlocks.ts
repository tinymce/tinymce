/**
 * MergeBlocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option } from '@ephox/katamari';
import { Compare, Insert, Remove, Element, Traverse } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';
import PaddingBr from '../dom/PaddingBr';
import Parents from '../dom/Parents';

const getChildrenUntilBlockBoundary = function (block) {
  const children = Traverse.children(block);
  return Arr.findIndex(children, ElementType.isBlock).fold(
    function () {
      return children;
    },
    function (index) {
      return children.slice(0, index);
    }
  );
};

const extractChildren = function (block) {
  const children = getChildrenUntilBlockBoundary(block);

  Arr.each(children, function (node) {
    Remove.remove(node);
  });

  return children;
};

const trimBr = function (first, block) {
  CaretFinder.positionIn(first, block.dom()).each(function (position) {
    const node = position.getNode();
    if (NodeType.isBr(node)) {
      Remove.remove(Element.fromDom(node));
    }
  });
};

const removeEmptyRoot = function (rootNode, block) {
  const parents = Parents.parentsAndSelf(block, rootNode);
  return Arr.find(parents.reverse(), Empty.isEmpty).each(Remove.remove);
};

const findParentInsertPoint = function (toBlock, block) {
  const parents = Traverse.parents(block, function (elm) {
    return Compare.eq(elm, toBlock);
  });

  return Option.from(parents[parents.length - 2]);
};

const getInsertionPoint = function (fromBlock, toBlock) {
  if (Compare.contains(toBlock, fromBlock)) {
    return Traverse.parent(fromBlock).bind(function (parent) {
      return Compare.eq(parent, toBlock) ? Option.some(fromBlock) : findParentInsertPoint(toBlock, fromBlock);
    });
  } else {
    return Option.none();
  }
};

const mergeBlockInto = function (rootNode, fromBlock, toBlock) {
  if (Empty.isEmpty(toBlock)) {
    Remove.remove(toBlock);

    if (Empty.isEmpty(fromBlock)) {
      PaddingBr.fillWithPaddingBr(fromBlock);
    }

    return CaretFinder.firstPositionIn(fromBlock.dom());
  } else {
    trimBr(true, fromBlock);
    trimBr(false, toBlock);

    const children = extractChildren(fromBlock);

    return getInsertionPoint(fromBlock, toBlock).fold(
      function () {
        removeEmptyRoot(rootNode, fromBlock);

        const position = CaretFinder.lastPositionIn(toBlock.dom());

        Arr.each(children, function (node) {
          Insert.append(toBlock, node);
        });

        return position;
      },
      function (target) {
        const position = CaretFinder.prevPosition(toBlock.dom(), CaretPosition.before(target.dom()));

        Arr.each(children, function (node) {
          Insert.before(target, node);
        });

        removeEmptyRoot(rootNode, fromBlock);

        return position;
      }
    );
  }
};

const mergeBlocks = function (rootNode, forward, block1, block2) {
  return forward ? mergeBlockInto(rootNode, block2, block1) : mergeBlockInto(rootNode, block1, block2);
};

export default {
  mergeBlocks
};