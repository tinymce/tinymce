/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Traverse, Attribute, SugarElement, SugarNode, SelectorFind, Direction, SelectorFilter } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

const getParentElement = (element: SugarElement<Element>): Optional<SugarElement<Element>> => {
  return Traverse.parent(element).filter(SugarNode.isElement);
};

// if the block is a list item, we need to get the parent of the list itself
const getNormalizedBlock = (element: SugarElement<Element>, isListItem: boolean): SugarElement<Element> => {
  const normalizedElement = isListItem ? SelectorFind.ancestor(element, 'ol,ul') : Optional.some(element);
  return normalizedElement.getOr(element);
};

const isListItem = SugarNode.isTag('li');

const setDir = (editor: Editor, dir: Dir): void => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  if (selectedBlocks.length > 0) {
    Arr.each(selectedBlocks, (block) => {
      const sugarBlock = SugarElement.fromDom(block);
      const isSugarBlockListItem = isListItem(sugarBlock);
      const normalizedBlock = getNormalizedBlock(sugarBlock, isSugarBlockListItem);
      const normalizedBlockParent = getParentElement(normalizedBlock);
      normalizedBlockParent.each((parent) => {
        const parentDirection = Direction.getDirection(parent);
        if (parentDirection !== dir) {
          Attribute.set(normalizedBlock, 'dir', dir);
        } else if (Direction.getDirection(normalizedBlock) !== dir) {
          Attribute.remove(normalizedBlock, 'dir');
        }

        // remove dir attr from list children
        if (isSugarBlockListItem) {
          const listItems = SelectorFilter.children(normalizedBlock, 'li[dir]');
          Arr.each(listItems, (listItem) => Attribute.remove(listItem, 'dir'));
        }
      });
    });
    editor.nodeChanged();
  }
};

export {
  setDir
};
