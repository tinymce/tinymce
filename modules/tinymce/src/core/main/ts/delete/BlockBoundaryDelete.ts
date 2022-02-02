/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as BlockMergeBoundary from './BlockMergeBoundary';
import * as MergeBlocks from './MergeBlocks';

const backspaceDelete = (editor: Editor, forward: boolean): boolean => {
  const rootNode = SugarElement.fromDom(editor.getBody());

  const position = BlockMergeBoundary.read(rootNode.dom, forward, editor.selection.getRng()).bind((blockBoundary) =>
    MergeBlocks.mergeBlocks(rootNode, forward, blockBoundary.from.block, blockBoundary.to.block));

  position.each((pos) => {
    editor.selection.setRng(pos.toRange());
  });

  return position.isSome();
};

export {
  backspaceDelete
};
