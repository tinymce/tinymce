import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as NodeType from './NodeType';
import { createTextBlock } from './TextBlock';

const DOM = DOMUtils.DOM;

const splitList = (editor: Editor, list: Element, li: Element): void => {
  const removeAndKeepBookmarks = (targetNode: Node) => {
    const parent = targetNode.parentNode;
    if (parent) {
      Tools.each(bookmarks, (node) => {
        parent.insertBefore(node, li.parentNode);
      });
    }

    DOM.remove(targetNode);
  };

  const bookmarks = DOM.select('span[data-mce-type="bookmark"]', list);
  const newBlock = createTextBlock(editor, li);
  const tmpRng = DOM.createRng();
  tmpRng.setStartAfter(li);
  tmpRng.setEndAfter(list);
  const fragment = tmpRng.extractContents();

  for (let node = fragment.firstChild; node; node = node.firstChild) {
    if (node.nodeName === 'LI' && editor.dom.isEmpty(node)) {
      DOM.remove(node);
      break;
    }
  }

  if (!editor.dom.isEmpty(fragment)) {
    DOM.insertAfter(fragment, list);
  }

  DOM.insertAfter(newBlock, list);

  const parent = li.parentElement;
  if (parent && NodeType.isEmpty(editor.dom, parent)) {
    removeAndKeepBookmarks(parent);
  }

  DOM.remove(li);

  if (NodeType.isEmpty(editor.dom, list)) {
    DOM.remove(list);
  }
};

export {
  splitList
};
