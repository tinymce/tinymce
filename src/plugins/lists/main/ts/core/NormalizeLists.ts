/**
 * NormalizeLists.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import NodeType from './NodeType';

const DOM = DOMUtils.DOM;

const normalizeList = function (dom, ul) {
  let sibling;
  const parentNode = ul.parentNode;

  // Move UL/OL to previous LI if it's the only child of a LI
  if (parentNode.nodeName === 'LI' && parentNode.firstChild === ul) {
    sibling = parentNode.previousSibling;
    if (sibling && sibling.nodeName === 'LI') {
      sibling.appendChild(ul);

      if (NodeType.isEmpty(dom, parentNode)) {
        DOM.remove(parentNode);
      }
    } else {
      DOM.setStyle(parentNode, 'listStyleType', 'none');
    }
  }

  // Append OL/UL to previous LI if it's in a parent OL/UL i.e. old HTML4
  if (NodeType.isListNode(parentNode)) {
    sibling = parentNode.previousSibling;
    if (sibling && sibling.nodeName === 'LI') {
      sibling.appendChild(ul);
    }
  }
};

const normalizeLists = function (dom, element) {
  Tools.each(Tools.grep(dom.select('ol,ul', element)), function (ul) {
    normalizeList(dom, ul);
  });
};

export default {
  normalizeList,
  normalizeLists
};