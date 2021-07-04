/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, SugarElement } from '@ephox/sugar';

import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as DeleteUtils from './DeleteUtils';
import * as MergeBlocks from './MergeBlocks';

const deleteRangeMergeBlocks = (rootNode: SugarElement<Node>, selection: EditorSelection): boolean => {
  const rng = selection.getRng();

  return Optionals.lift2(
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.startContainer)),
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.endContainer)),
    (block1, block2) => {
      if (Compare.eq(block1, block2) === false) {
        rng.deleteContents();

        MergeBlocks.mergeBlocks(rootNode, true, block1, block2).each((pos) => {
          selection.setRng(pos.toRange());
        });

        return true;
      } else {
        return false;
      }
    }).getOr(false);
};

const isRawNodeInTable = (root: SugarElement<Node>, rawNode: Node): boolean => {
  const node = SugarElement.fromDom(rawNode);
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.ancestor(node, ElementType.isTableCell, isRoot).isSome();
};

const isSelectionInTable = (root: SugarElement<Node>, rng: Range): boolean =>
  isRawNodeInTable(root, rng.startContainer) || isRawNodeInTable(root, rng.endContainer);

const isEverythingSelected = (root: SugarElement<Node>, rng: Range): boolean => {
  const noPrevious = CaretFinder.prevPosition(root.dom, CaretPosition.fromRangeStart(rng)).isNone();
  const noNext = CaretFinder.nextPosition(root.dom, CaretPosition.fromRangeEnd(rng)).isNone();
  return !isSelectionInTable(root, rng) && noPrevious && noNext;
};

const emptyEditor = (editor: Editor): boolean => {
  editor.setContent('');
  editor.selection.setCursorLocation();
  return true;
};

const deleteRange = (editor: Editor): boolean => {
  const rootNode = SugarElement.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  return isEverythingSelected(rootNode, rng) ? emptyEditor(editor) : deleteRangeMergeBlocks(rootNode, editor.selection);
};

const backspaceDelete = (editor: Editor, _forward: boolean): boolean =>
  editor.selection.isCollapsed() ? false : deleteRange(editor);

export {
  backspaceDelete
};
