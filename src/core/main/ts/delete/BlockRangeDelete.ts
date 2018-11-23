/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Options } from '@ephox/katamari';
import { Compare, Element, PredicateFind } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import DeleteUtils from './DeleteUtils';
import MergeBlocks from './MergeBlocks';
import * as ElementType from '../dom/ElementType';
import { Selection } from '../api/dom/Selection';

const deleteRangeMergeBlocks = function (rootNode, selection: Selection) {
  const rng = selection.getRng();

  return Options.liftN([
    DeleteUtils.getParentBlock(rootNode, Element.fromDom(rng.startContainer)),
    DeleteUtils.getParentBlock(rootNode, Element.fromDom(rng.endContainer))
  ], function (block1, block2) {
    if (Compare.eq(block1, block2) === false) {
      rng.deleteContents();

      MergeBlocks.mergeBlocks(rootNode, true, block1, block2).each(function (pos) {
        selection.setRng(pos.toRange());
      });

      return true;
    } else {
      return false;
    }
  }).getOr(false);
};

const isRawNodeInTable = function (root, rawNode) {
  const node = Element.fromDom(rawNode);
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.ancestor(node, ElementType.isTableCell, isRoot).isSome();
};

const isSelectionInTable = function (root, rng) {
  return isRawNodeInTable(root, rng.startContainer) || isRawNodeInTable(root, rng.endContainer);
};

const isEverythingSelected = function (root, rng) {
  const noPrevious = CaretFinder.prevPosition(root.dom(), CaretPosition.fromRangeStart(rng)).isNone();
  const noNext = CaretFinder.nextPosition(root.dom(), CaretPosition.fromRangeEnd(rng)).isNone();
  return !isSelectionInTable(root, rng) && noPrevious && noNext;
};

const emptyEditor = function (editor) {
  editor.setContent('');
  editor.selection.setCursorLocation();
  return true;
};

const deleteRange = function (editor) {
  const rootNode = Element.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  return isEverythingSelected(rootNode, rng) ? emptyEditor(editor) : deleteRangeMergeBlocks(rootNode, editor.selection);
};

const backspaceDelete = function (editor, forward) {
  return editor.selection.isCollapsed() ? false : deleteRange(editor);
};

export default {
  backspaceDelete
};