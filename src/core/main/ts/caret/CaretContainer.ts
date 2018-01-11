/**
 * CaretContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NodeType from '../dom/NodeType';
import Zwsp from '../text/Zwsp';

/**
 * This module handles caret containers. A caret container is a node that
 * holds the caret for positional purposes.
 *
 * @private
 * @class tinymce.caret.CaretContainer
 */

const isElement = NodeType.isElement,
  isText = NodeType.isText;

const isCaretContainerBlock = function (node) {
  if (isText(node)) {
    node = node.parentNode;
  }

  return isElement(node) && node.hasAttribute('data-mce-caret');
};

const isCaretContainerInline = function (node) {
  return isText(node) && Zwsp.isZwsp(node.data);
};

const isCaretContainer = function (node) {
  return isCaretContainerBlock(node) || isCaretContainerInline(node);
};

const hasContent = function (node) {
  return node.firstChild !== node.lastChild || !NodeType.isBr(node.firstChild);
};

const insertInline = function (node, before) {
  let doc, sibling, textNode, parentNode;

  doc = node.ownerDocument;
  textNode = doc.createTextNode(Zwsp.ZWSP);
  parentNode = node.parentNode;

  if (!before) {
    sibling = node.nextSibling;
    if (isText(sibling)) {
      if (isCaretContainer(sibling)) {
        return sibling;
      }

      if (startsWithCaretContainer(sibling)) {
        sibling.splitText(1);
        return sibling;
      }
    }

    if (node.nextSibling) {
      parentNode.insertBefore(textNode, node.nextSibling);
    } else {
      parentNode.appendChild(textNode);
    }
  } else {
    sibling = node.previousSibling;
    if (isText(sibling)) {
      if (isCaretContainer(sibling)) {
        return sibling;
      }

      if (endsWithCaretContainer(sibling)) {
        return sibling.splitText(sibling.data.length - 1);
      }
    }

    parentNode.insertBefore(textNode, node);
  }

  return textNode;
};

const prependInline = function (node) {
  if (NodeType.isText(node)) {
    const data = node.data;
    if (data.length > 0 && data.charAt(0) !== Zwsp.ZWSP) {
      node.insertData(0, Zwsp.ZWSP);
    }
    return node;
  } else {
    return null;
  }
};

const appendInline = function (node) {
  if (NodeType.isText(node)) {
    const data = node.data;
    if (data.length > 0 && data.charAt(data.length - 1) !== Zwsp.ZWSP) {
      node.insertData(data.length, Zwsp.ZWSP);
    }
    return node;
  } else {
    return null;
  }
};

const isBeforeInline = function (pos) {
  return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset()) === Zwsp.ZWSP;
};

const isAfterInline = function (pos) {
  return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset() - 1) === Zwsp.ZWSP;
};

const createBogusBr = function () {
  const br = document.createElement('br');
  br.setAttribute('data-mce-bogus', '1');
  return br;
};

const insertBlock = function (blockName, node, before) {
  let doc, blockNode, parentNode;

  doc = node.ownerDocument;
  blockNode = doc.createElement(blockName);
  blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
  blockNode.setAttribute('data-mce-bogus', 'all');
  blockNode.appendChild(createBogusBr());
  parentNode = node.parentNode;

  if (!before) {
    if (node.nextSibling) {
      parentNode.insertBefore(blockNode, node.nextSibling);
    } else {
      parentNode.appendChild(blockNode);
    }
  } else {
    parentNode.insertBefore(blockNode, node);
  }

  return blockNode;
};

const startsWithCaretContainer = function (node) {
  return isText(node) && node.data[0] === Zwsp.ZWSP;
};

const endsWithCaretContainer = function (node) {
  return isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;
};

const trimBogusBr = function (elm) {
  const brs = elm.getElementsByTagName('br');
  const lastBr = brs[brs.length - 1];
  if (NodeType.isBogus(lastBr)) {
    lastBr.parentNode.removeChild(lastBr);
  }
};

const showCaretContainerBlock = function (caretContainer) {
  if (caretContainer && caretContainer.hasAttribute('data-mce-caret')) {
    trimBogusBr(caretContainer);
    caretContainer.removeAttribute('data-mce-caret');
    caretContainer.removeAttribute('data-mce-bogus');
    caretContainer.removeAttribute('style');
    caretContainer.removeAttribute('_moz_abspos');
    return caretContainer;
  }

  return null;
};

export default {
  isCaretContainer,
  isCaretContainerBlock,
  isCaretContainerInline,
  showCaretContainerBlock,
  insertInline,
  prependInline,
  appendInline,
  isBeforeInline,
  isAfterInline,
  insertBlock,
  hasContent,
  startsWithCaretContainer,
  endsWithCaretContainer
};