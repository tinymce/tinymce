/**
 * NodeType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isTextNode = function (node: Node): node is Text {
  return node && node.nodeType === 3;
};

const isListNode = function (node) {
  return node && (/^(OL|UL|DL)$/).test(node.nodeName);
};

const isListItemNode = function (node) {
  return node && /^(LI|DT|DD)$/.test(node.nodeName);
};

const isTableCellNode = function (node) {
  return node && /^(TH|TD)$/.test(node.nodeName);
};

const isBr = function (node) {
  return node && node.nodeName === 'BR';
};

const isFirstChild = function (node) {
  return node.parentNode.firstChild === node;
};

const isLastChild = function (node) {
  return node.parentNode.lastChild === node;
};

const isTextBlock = function (editor, node) {
  return node && !!editor.schema.getTextBlockElements()[node.nodeName];
};

const isBlock = function (node, blockElements) {
  return node && node.nodeName in blockElements;
};

const isBogusBr = function (dom, node) {
  if (!isBr(node)) {
    return false;
  }

  if (dom.isBlock(node.nextSibling) && !isBr(node.previousSibling)) {
    return true;
  }

  return false;
};

const isEmpty = function (dom, elm, keepBookmarks?) {
  const empty = dom.isEmpty(elm);

  if (keepBookmarks && dom.select('span[data-mce-type=bookmark]', elm).length > 0) {
    return false;
  }

  return empty;
};

const isChildOfBody = function (dom, elm) {
  return dom.isChildOf(elm, dom.getRoot());
};

export default {
  isTextNode,
  isListNode,
  isListItemNode,
  isTableCellNode,
  isBr,
  isFirstChild,
  isLastChild,
  isTextBlock,
  isBlock,
  isBogusBr,
  isEmpty,
  isChildOfBody
};