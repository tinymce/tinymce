import { Arr } from '@ephox/katamari';

import * as NodeType from '../dom/NodeType';
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
const isInvalidTextElement = NodeType.matchNodeNames([ 'script', 'style', 'textarea' ]);
const isAtomicInline = NodeType.matchNodeNames([ 'img', 'input', 'textarea', 'hr', 'iframe', 'video', 'audio', 'object', 'embed' ]);
const isTable = NodeType.matchNodeNames([ 'table' ]);
const isCaretContainer = CaretContainer.isCaretContainer;

const isCaretCandidate = (node: Node | null | undefined): node is Text | Element => {
  if (isCaretContainer(node)) {
    return false;
  }

  if (isText(node)) {
    return !isInvalidTextElement(node.parentNode);
  }

  return isAtomicInline(node) || isBr(node) || isTable(node) || isNonUiContentEditableFalse(node);
};

// UI components on IE is marked with contenteditable=false and unselectable=true so lets not handle those as real content editables
const isUnselectable = (node: Node | null | undefined): boolean =>
  NodeType.isElement(node) && node.getAttribute('unselectable') === 'true';

const isNonUiContentEditableFalse = (node: Node | null | undefined): node is HTMLElement =>
  !isUnselectable(node) && isContentEditableFalse(node);

const isInEditable = (node: Node, root?: Node): boolean => {
  for (let tempNode = node.parentNode; tempNode && tempNode !== root; tempNode = tempNode.parentNode) {
    if (isNonUiContentEditableFalse(tempNode)) {
      return false;
    }

    if (isContentEditableTrue(tempNode)) {
      return true;
    }
  }

  return true;
};

const isAtomicContentEditableFalse = (node: Node): boolean => {
  if (!isNonUiContentEditableFalse(node)) {
    return false;
  }

  return !Arr.foldl(Arr.from(node.getElementsByTagName('*')), (result, elm) => {
    return result || isContentEditableTrue(elm);
  }, false);
};

const isAtomic = (node: Node): boolean =>
  isAtomicInline(node) || isAtomicContentEditableFalse(node);

const isEditableCaretCandidate = (node: Node | null, root?: Node): node is NonNullable<Node> =>
  isCaretCandidate(node) && isInEditable(node, root);

export {
  isCaretCandidate,
  isInEditable,
  isAtomic,
  isEditableCaretCandidate
};
