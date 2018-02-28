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
import * as CaretContainer from './CaretContainer';

/**
 * This module contains logic for handling caret candidates. A caret candidate is
 * for example text nodes, images, input elements, cE=false elements etc.
 *
 * @private
 * @class tinymce.caret.CaretCandidate
 */

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;
const isBr = NodeType.isBr;
const isText = NodeType.isText;
const isInvalidTextElement = NodeType.matchNodeNames('script style textarea');
const isAtomicInline = NodeType.matchNodeNames('img input textarea hr iframe video audio object');
const isTable = NodeType.matchNodeNames('table');
const isCaretContainer = CaretContainer.isCaretContainer;

const isCaretCandidate = (node: Node): boolean => {
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

const isInEditable = (node: Node, root: Node): boolean => {
  for (node = node.parentNode; node && node !== root; node = node.parentNode) {
    if (isContentEditableFalse(node)) {
      return false;
    }

    if (isContentEditableTrue(node)) {
      return true;
    }
  }

  return true;
};

const isAtomicContentEditableFalse = (node: Node): boolean => {
  if (!isContentEditableFalse(node)) {
    return false;
  }

  return Arr.reduce(node.getElementsByTagName('*'), function (result, elm) {
    return result || isContentEditableTrue(elm);
  }, false) !== true;
};

const isAtomic = (node: Node): boolean => isAtomicInline(node) || isAtomicContentEditableFalse(node);
const isEditableCaretCandidate = (node: Node, root?: Node) => isCaretCandidate(node) && isInEditable(node, root);

export {
  isCaretCandidate,
  isInEditable,
  isAtomic,
  isEditableCaretCandidate
};