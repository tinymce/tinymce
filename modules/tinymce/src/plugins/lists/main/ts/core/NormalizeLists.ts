import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';

import * as NodeType from './NodeType';

const DOM = DOMUtils.DOM;

const normalizeList = (dom: DOMUtils, list: HTMLUListElement | HTMLOListElement): void => {
  const parentNode = list.parentElement;

  // Move UL/OL to previous LI if it's the only child of a LI
  if (parentNode && parentNode.nodeName === 'LI' && parentNode.firstChild === list) {
    const sibling = parentNode.previousSibling;
    if (sibling && sibling.nodeName === 'LI') {
      sibling.appendChild(list);

      if (NodeType.isEmpty(dom, parentNode)) {
        DOM.remove(parentNode);
      }
    } else {
      DOM.setStyle(parentNode, 'listStyleType', 'none');
    }
  }

  // Append OL/UL to previous LI if it's in a parent OL/UL i.e. old HTML4
  if (NodeType.isListNode(parentNode)) {
    const sibling = parentNode.previousSibling;
    if (sibling && sibling.nodeName === 'LI') {
      sibling.appendChild(list);
    }
  }
};

const normalizeLists = (dom: DOMUtils, element: Element): void => {
  const lists = Tools.grep(dom.select<HTMLUListElement | HTMLOListElement>('ol,ul', element));
  Tools.each(lists, (list) => {
    normalizeList(dom, list);
  });
};

export {
  normalizeList,
  normalizeLists
};
