import { Arr, Optional } from '@ephox/katamari';
import { Traverse, Attribute, SugarElement, SugarNode, SelectorFind, Direction, SelectorFilter, Css } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

const getParentElement = (element: SugarElement<Element>): Optional<SugarElement<Element>> =>
  Traverse.parent(element).filter(SugarNode.isElement);

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
    const normalizedBlockParent = getParentElement(normalizedBlock);
    normalizedBlockParent.each((parent) => {
      const parentDirection = Direction.getDirection(parent);
      if (parentDirection !== dir) {
        Attribute.set(normalizedBlock, 'dir', dir);
      } else {
        Attribute.remove(normalizedBlock, 'dir');
      }

      // TINY-9314: Set an inline direction style if computed css direction is still not as desired. This can
      // happen either when there already is an inline direction style or a direction style is
      // derived from the stylesheet.
      if (Direction.getDirection(normalizedBlock) !== dir) {
        dom.setStyle(normalizedBlock.dom, 'direction', dir);
      }

      // remove dir attr and direction style from list children
      if (isBlockElementListItem) {
        const listItems = SelectorFilter.children(normalizedBlock, 'li[dir],li[style]');
        Arr.each(listItems, (listItem) => {
          Attribute.remove(listItem, 'dir');
          Css.remove(listItem, 'direction');
        });
      }
    });
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
