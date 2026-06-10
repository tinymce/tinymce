import { Arr, Optional, Strings } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode, SelectorFind, Direction, SelectorFilter, Css } from '@ephox/sugar';

import type DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import type Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

// if the block is a list item, we need to get the parent of the list itself
const getNormalizedBlock = (element: SugarElement<Element>, isListItem: boolean): SugarElement<Element> => {
  const normalizedElement = isListItem ? SelectorFind.ancestor(element, 'ol,ul') : Optional.some(element);
  return normalizedElement.getOr(element);
};

const isListItem = SugarNode.isTag('li');

const setDirOnElements = (dom: DOMUtils, blocks: Element[], dir: Dir): void => {
  Arr.each(blocks, (block) => {
    const blockElement = SugarElement.fromDom(block);
    const isBlockElementListItem = isListItem(blockElement);
    const normalizedBlock = getNormalizedBlock(blockElement, isBlockElementListItem);

    const attrDir = Attribute.get(normalizedBlock, 'dir');
    const styleDir = Optional.from(dom.getStyle(normalizedBlock.dom, 'direction', false))
      .filter(Strings.isNotEmpty);

    if (attrDir === dir || styleDir.exists((d) => d === dir)) {
      // If already set to given dir, toggle dir off
      Attribute.remove(normalizedBlock, 'dir');
      Css.remove(normalizedBlock, 'direction');
    } else if (attrDir !== dir) {
      Attribute.set(normalizedBlock, 'dir', dir); // Set the dir attribute to the desired direction
      if (styleDir.exists((d) => d !== dir) || Direction.getDirection(normalizedBlock) !== dir) {
        // Also set the inline direction style if it was already set or if necessary to override inherited direction
        dom.setStyle(normalizedBlock.dom, 'direction', dir);
      }
    }

    // Remove dir attr and direction style from list children
    if (isBlockElementListItem) {
      const listItems = SelectorFilter.children(normalizedBlock, 'li[dir],li[style]');
      Arr.each(listItems, (listItem) => {
        Attribute.remove(listItem, 'dir');
        dom.setStyle(listItem.dom, 'direction', null);
      });
    }
  });
};

const setDir = (editor: Editor, dir: Dir): void => {
  if (editor.selection.isEditable()) {
    setDirOnElements(editor.dom, editor.selection.getSelectedBlocks(), dir);
    editor.nodeChanged();
  }
};

export {
  setDir
};
