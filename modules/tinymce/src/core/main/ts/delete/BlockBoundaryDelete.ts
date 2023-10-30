import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as BlockMergeBoundary from './BlockMergeBoundary';
import * as MergeBlocks from './MergeBlocks';

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> => {
  const rootNode = SugarElement.fromDom(editor.getBody());

  const position = BlockMergeBoundary.read(rootNode.dom, forward, editor.selection.getRng())
    .map((blockBoundary) =>
      () => {
        MergeBlocks.mergeBlocks(rootNode, forward, blockBoundary.from.block, blockBoundary.to.block, editor.schema)
          .each((pos) => {
            editor.selection.setRng(pos.toRange());
          });
      });

  return position;
};

export {
  backspaceDelete
};
