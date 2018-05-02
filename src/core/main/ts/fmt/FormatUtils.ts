/**
 * FormatUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import TreeWalker from '../api/dom/TreeWalker';
import { Selection } from '../api/dom/Selection';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import { Range } from '@ephox/dom-globals';

const isInlineBlock = function (node) {
  return node && /^(IMG)$/.test(node.nodeName);
};

const moveStart = function (dom: DOMUtils, selection: Selection, rng: Range) {
  const offset = rng.startOffset;
  let container = rng.startContainer, walker, node, nodes;

  if (rng.startContainer === rng.endContainer) {
    if (isInlineBlock(rng.startContainer.childNodes[rng.startOffset])) {
      return;
    }
  }

  // Move startContainer/startOffset in to a suitable node
  if (container.nodeType === 1) {
    nodes = container.childNodes;
    if (offset < nodes.length) {
      container = nodes[offset];
      walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));
    } else {
      container = nodes[nodes.length - 1];
      walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));
      walker.next(true);
    }

    for (node = walker.current(); node; node = walker.next()) {
      if (node.nodeType === 3 && !isWhiteSpaceNode(node)) {
        rng.setStart(node, 0);
        selection.setRng(rng);

        return;
      }
    }
  }
};

/**
 * Returns the next/previous non whitespace node.
 *
 * @private
 * @param {Node} node Node to start at.
 * @param {boolean} next (Optional) Include next or previous node defaults to previous.
 * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
 * @return {Node} Next or previous node or undefined if it wasn't found.
 */
const getNonWhiteSpaceSibling = function (node, next?, inc?) {
  if (node) {
    next = next ? 'nextSibling' : 'previousSibling';

    for (node = inc ? node : node[next]; node; node = node[next]) {
      if (node.nodeType === 1 || !isWhiteSpaceNode(node)) {
        return node;
      }
    }
  }
};

const isTextBlock = function (editor, name) {
  if (name.nodeType) {
    name = name.nodeName;
  }

  return !!editor.schema.getTextBlockElements()[name.toLowerCase()];
};

const isValid = function (ed, parent, child) {
  return ed.schema.isValidChild(parent, child);
};

const isWhiteSpaceNode = function (node) {
  return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
};

/**
 * Replaces variables in the value. The variable format is %var.
 *
 * @private
 * @param {String} value Value to replace variables in.
 * @param {Object} vars Name/value array with variables to replace.
 * @return {String} New value with replaced variables.
 */
const replaceVars = function (value, vars) {
  if (typeof value !== 'string') {
    value = value(vars);
  } else if (vars) {
    value = value.replace(/%(\w+)/g, function (str, name) {
      return vars[name] || str;
    });
  }

  return value;
};

/**
 * Compares two string/nodes regardless of their case.
 *
 * @private
 * @param {String/Node} str1 Node or string to compare.
 * @param {String/Node} str2 Node or string to compare.
 * @return {boolean} True/false if they match.
 */
const isEq = function (str1, str2) {
  str1 = str1 || '';
  str2 = str2 || '';

  str1 = '' + (str1.nodeName || str1);
  str2 = '' + (str2.nodeName || str2);

  return str1.toLowerCase() === str2.toLowerCase();
};

const normalizeStyleValue = function (dom, value, name) {
  // Force the format to hex
  if (name === 'color' || name === 'backgroundColor') {
    value = dom.toHex(value);
  }

  // Opera will return bold as 700
  if (name === 'fontWeight' && value === 700) {
    value = 'bold';
  }

  // Normalize fontFamily so "'Font name', Font" becomes: "Font name,Font"
  if (name === 'fontFamily') {
    value = value.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
  }

  return '' + value;
};

const getStyle = function (dom, node, name) {
  return normalizeStyleValue(dom, dom.getStyle(node, name), name);
};

const getTextDecoration = function (dom, node) {
  let decoration;

  dom.getParent(node, function (n) {
    decoration = dom.getStyle(n, 'text-decoration');
    return decoration && decoration !== 'none';
  });

  return decoration;
};

const getParents = function (dom, node, selector?) {
  return dom.getParents(node, selector, dom.getRoot());
};

export default {
  isInlineBlock,
  moveStart,
  getNonWhiteSpaceSibling,
  isTextBlock,
  isValid,
  isWhiteSpaceNode,
  replaceVars,
  isEq,
  normalizeStyleValue,
  getStyle,
  getTextDecoration,
  getParents
};