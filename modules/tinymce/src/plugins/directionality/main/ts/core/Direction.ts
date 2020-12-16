/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const setDir = (editor: Editor, dir: string) => {
  const dom = editor.dom;
  let curDir;
  const blocks = editor.selection.getSelectedBlocks();

  if (blocks.length) {
    curDir = dom.getAttrib(blocks[0], 'dir');

    Tools.each(blocks, (block) => {
      // Add dir to block if the parent block doesn't already have that dir
      if (!dom.getParent(block.parentNode, '*[dir="' + dir + '"]', dom.getRoot())) {
        dom.setAttrib(block, 'dir', curDir !== dir ? dir : null);
      }
    });

    editor.nodeChanged();
  }
};

export {
  setDir
};
