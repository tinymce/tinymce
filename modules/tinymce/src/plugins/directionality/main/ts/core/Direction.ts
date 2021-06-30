/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Type } from '@ephox/katamari';
import { Traverse, Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

const getParentElement = (element: SugarElement<Element>): Optional<SugarElement<Element>> => Traverse.parent(element).filter(SugarNode.isElement);

const setDir = (editor: Editor, dir: Dir) => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  Arr.each(selectedBlocks, (block) => {
    const sugarBlock = SugarElement.fromDom(block);
    const blockParent = getParentElement(sugarBlock);
    blockParent.each((blockParent) => {
      const blockParentDirection = Attribute.get(blockParent, 'dir');
      if (Type.isUndefined(blockParentDirection) ||
        Type.isNull(blockParentDirection) ||
        blockParentDirection.trim() === '' ||
        blockParentDirection !== dir) {
        setDirAttr(editor, sugarBlock, dir);
      } else { // if parent and child dir are going to be the same then remove it from child
        Attribute.remove(sugarBlock, 'dir');
        editor.nodeChanged();
      }
    });
  });
};

const isListItem = SugarNode.isTag('li');

const setDirAttr = (editor: Editor, element: SugarElement<Element>, dir: Dir): void => {
  if (isListItem(element)) {
    const list = getParentElement(element);
    list.each((l) => Attribute.set(l, 'dir', dir));
  } else {
    Attribute.set(element, 'dir', dir);
  }

  editor.nodeChanged();
};


export {
  setDir
};
