/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/sugar';
import BlockMergeBoundary from './BlockMergeBoundary';
import MergeBlocks from './MergeBlocks';

const backspaceDelete = function (editor, forward) {
  let position;
  const rootNode = Element.fromDom(editor.getBody());

  position = BlockMergeBoundary.read(rootNode.dom(), forward, editor.selection.getRng()).bind(function (blockBoundary) {
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