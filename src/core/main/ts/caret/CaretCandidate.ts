/**
 * CaretCandidate.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NodeType from '../dom/NodeType';
import Arr from '../util/Arr';
import CaretContainer from './CaretContainer';

/**
 * This module contains logic for handling caret candidates. A caret candidate is
 * for example text nodes, images, input elements, cE=false elements etc.
 *
 * @private
 * @class tinymce.caret.CaretCandidate
 */

const isContentEditableTrue = NodeType.isContentEditableTrue,
  isContentEditableFalse = NodeType.isContentEditableFalse,
  isBr = NodeType.isBr,
  isText = NodeType.isText,
  isInvalidTextElement = NodeType.matchNodeNames('script style textarea'),
  isAtomicInline = NodeType.matchNodeNames('img input textarea hr iframe video audio object'),
  isTable = NodeType.matchNodeNames('table'),
  isCaretContainer = CaretContainer.isCaretContainer;

const isCaretCandidate = function (node) {
  if (isCaretContainer(node)) {
    return false;
  }

  if (isText(node)) {
    if (isInvalidTextElement(node.parentNode)) {
      return false;
    }

    return true;
  }

  return isAtomicInline(node) || isBr(node) || isTable(node) || isContentEditableFalse(node);
};

const isInEditable = function (node, rootNode) {
  for (node = node.parentNode; node && node !== rootNode; node = node.parentNode) {
    if (isContentEditableFalse(node)) {
      return false;
    }

    if (isContentEditableTrue(node)) {
      return true;
    }
  }

  return true;
};

const isAtomicContentEditableFalse = function (node) {
  if (!isContentEditableFalse(node)) {
    return false;
  }

  return Arr.reduce(node.getElementsByTagName('*'), function (result, elm) {
    return result || isContentEditableTrue(elm);
  }, false) !== true;
};

const isAtomic = function (node) {
  return isAtomicInline(node) || isAtomicContentEditableFalse(node);
};

const isEditableCaretCandidate = function (node, rootNode?) {
  return isCaretCandidate(node) && isInEditable(node, rootNode);
};

export default {
  isCaretCandidate,
  isInEditable,
  isAtomic,
  isEditableCaretCandidate
};