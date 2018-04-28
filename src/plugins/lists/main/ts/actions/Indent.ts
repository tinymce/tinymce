/**
 * Indent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Bookmark from '../core/Bookmark';
import NodeType from '../core/NodeType';
import Selection from '../core/Selection';

const DOM = DOMUtils.DOM;

const mergeLists = function (from, to) {
  let node;

  if (NodeType.isListNode(from)) {
    while ((node = from.firstChild)) {
      to.appendChild(node);
    }

    DOM.remove(from);
  }
};

const indent = function (li) {
  let sibling, newList, listStyle;

  if (li.nodeName === 'DT') {
    DOM.rename(li, 'DD');
    return true;
  }

  sibling = li.previousSibling;

  if (sibling && NodeType.isListNode(sibling)) {
    sibling.appendChild(li);
    return true;
  }

  if (sibling && sibling.nodeName === 'LI' && NodeType.isListNode(sibling.lastChild)) {
    sibling.lastChild.appendChild(li);
    mergeLists(li.lastChild, sibling.lastChild);
    return true;
  }

  sibling = li.nextSibling;

  if (sibling && NodeType.isListNode(sibling)) {
    sibling.insertBefore(li, sibling.firstChild);
    return true;
  }

  /*if (sibling && sibling.nodeName === 'LI' && isListNode(li.lastChild)) {
    return false;
  }*/

  sibling = li.previousSibling;
  if (sibling && sibling.nodeName === 'LI') {
    newList = DOM.create(li.parentNode.nodeName);
    listStyle = DOM.getStyle(li.parentNode, 'listStyleType');
    if (listStyle) {
      DOM.setStyle(newList, 'listStyleType', listStyle);
    }
    sibling.appendChild(newList);
    newList.appendChild(li);
    mergeLists(li.lastChild, newList);
    return true;
  }

  return false;
};

const indentSelection = function (editor) {
  const listElements = Selection.getSelectedListItems(editor);

  if (listElements.length) {
    const bookmark = Bookmark.createBookmark(editor.selection.getRng(true));

    for (let i = 0; i < listElements.length; i++) {
      if (!indent(listElements[i]) && i === 0) {
        break;
      }
    }

    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
    editor.nodeChanged();

    return true;
  }
};

export default {
  indentSelection
};