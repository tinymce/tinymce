/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as NodeType from '../dom/NodeType';
import * as CaretContainer from './CaretContainer';
import { Node, HTMLElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

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
const isInvalidTextElement = NodeType.matchNodeNames([ 'script', 'style', 'textarea' ]);
const isAtomicInline = NodeType.matchNodeNames([ 'img', 'input', 'textarea', 'hr', 'iframe', 'video', 'audio', 'object' ]);
const isTable = NodeType.matchNodeNames([ 'table' ]);
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

  return isAtomicInline(node) || isBr(node) || isTable(node) || isNonUiContentEditableFalse(node);
};

// UI components on IE is marked with contenteditable=false and unselectable=true so lets not handle those as real content editables
const isUnselectable = (node: Node) => NodeType.isElement(node) && node.getAttribute('unselectable') === 'true';

const isNonUiContentEditableFalse = (node: Node): node is HTMLElement => isUnselectable(node) === false && isContentEditableFalse(node);

const isInEditable = (node: Node, root: Node): boolean => {
  for (node = node.parentNode; node && node !== root; node = node.parentNode) {
    if (isNonUiContentEditableFalse(node)) {
      return false;
    }

    if (isContentEditableTrue(node)) {
      return true;
    }
  }

  return true;
};

const isAtomicContentEditableFalse = (node: Node): boolean => {
  if (!isNonUiContentEditableFalse(node)) {
    return false;
  }

  return Arr.foldl(Arr.from(node.getElementsByTagName('*')), function (result, elm) {
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
