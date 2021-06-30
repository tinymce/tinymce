/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Traverse, Attribute, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

const setDir = (editor: Editor, dir: Dir) => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  Arr.each(selectedBlocks, (block) => {
    const sugarBlock = SugarElement.fromDom(block);
    const blockParent = Traverse.parent(sugarBlock);
    blockParent.each((blockParent: SugarElement<Element>) => {
      const blockParentDirection = Attribute.get(blockParent, 'dir');
      if ((blockParentDirection === undefined) || (blockParentDirection !== dir)) {
        setDirAttr(editor, sugarBlock, dir);
      } else { // if parent and child dir are going to be the same then remove it from child
        Attribute.remove(sugarBlock, 'dir');
        editor.nodeChanged();
      }
    });
  });
};

const setDirAttr = (editor: Editor, element: SugarElement, dir: Dir): void => {
  if (isListItem(element)) {
    const list = Traverse.parent(element);
    list.each((l: SugarElement<Element>) => Attribute.set(l, 'dir', dir));
  } else {
    Attribute.set(element, 'dir', dir);
  }

  editor.nodeChanged();
};

const isListItem = (element: SugarElement<Element>): boolean => element.dom.nodeName === 'LI';

export {
  setDir
};
