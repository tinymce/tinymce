/**
 * BlockBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Element } from '@ephox/sugar';
import BlockBoundary from './BlockBoundary';
import MergeBlocks from './MergeBlocks';

const backspaceDelete = function (editor, forward) {
  let position;
  const rootNode = Element.fromDom(editor.getBody());

  position = BlockBoundary.read(rootNode.dom(), forward, editor.selection.getRng()).bind(function (blockBoundary) {
    return MergeBlocks.mergeBlocks(rootNode, forward, blockBoundary.from().block(), blockBoundary.to().block());
  });

  position.each(function (pos) {
    editor.selection.setRng(pos.toRange());
  });

  return position.isSome();
};

export default {
  backspaceDelete
};