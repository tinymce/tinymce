import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as Zwsp from '../text/Zwsp';
import { CaretPosition } from './CaretPosition';

/**
 * This module handles caret containers. A caret container is a node that
 * holds the caret for positional purposes.
 *
 * @private
 * @class tinymce.caret.CaretContainer
 */

const isElement = NodeType.isElement;
const isText = NodeType.isText;

const isCaretContainerBlock = (node: Node | null | undefined): node is Text | Element => {
  if (isText(node)) {
    node = node.parentNode;
  }

  return isElement(node) && node.hasAttribute('data-mce-caret');
};

const isCaretContainerInline = (node: Node | null | undefined): node is Text =>
  isText(node) && Zwsp.isZwsp(node.data);

const isCaretContainer = (node: Node | null | undefined): boolean =>
  isCaretContainerBlock(node) || isCaretContainerInline(node);

const hasContent = (node: Node): boolean =>
  node.firstChild !== node.lastChild || !NodeType.isBr(node.firstChild);

const insertInline = (node: Node, before: boolean): Text => {
  const doc = node.ownerDocument ?? document;
  const textNode = doc.createTextNode(Zwsp.ZWSP);
  const parentNode = node.parentNode;

  if (!before) {
    const sibling = node.nextSibling;
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
      parentNode?.insertBefore(textNode, node.nextSibling);
    } else {
      parentNode?.appendChild(textNode);
    }
  } else {
    const sibling = node.previousSibling;
    if (isText(sibling)) {
      if (isCaretContainer(sibling)) {
        return sibling;
      }

      if (endsWithCaretContainer(sibling)) {
        return sibling.splitText(sibling.data.length - 1);
      }
    }

    parentNode?.insertBefore(textNode, node);
  }

  return textNode;
};

const prependInline = (node: Node | null): Node | null => {
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

const appendInline = (node: Node | null): Text | null => {
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

const isBeforeInline = (pos: CaretPosition): boolean => {
  const container = pos.container();
  if (!NodeType.isText(container)) {
    return false;
  }

  // The text nodes may not be normalized, so check the current node and the previous one
  return container.data.charAt(pos.offset()) === Zwsp.ZWSP || pos.isAtStart() && isCaretContainerInline(container.previousSibling);
};

const isAfterInline = (pos: CaretPosition): boolean => {
  const container = pos.container();
  if (!NodeType.isText(container)) {
    return false;
  }

  // The text nodes may not be normalized, so check the current node and the next one
  return container.data.charAt(pos.offset() - 1) === Zwsp.ZWSP || pos.isAtEnd() && isCaretContainerInline(container.nextSibling);
};

const insertBlock = (blockName: string, node: Node, before: boolean): HTMLElement => {
  const doc = node.ownerDocument ?? document;
  const blockNode = doc.createElement(blockName);
  blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
  blockNode.setAttribute('data-mce-bogus', 'all');
  blockNode.appendChild(PaddingBr.createPaddingBr().dom);
  const parentNode = node.parentNode;

  if (!before) {
    if (node.nextSibling) {
      parentNode?.insertBefore(blockNode, node.nextSibling);
    } else {
      parentNode?.appendChild(blockNode);
    }
  } else {
    parentNode?.insertBefore(blockNode, node);
  }

  return blockNode;
};

const startsWithCaretContainer = (node: Node | null): node is Text =>
  isText(node) && node.data[0] === Zwsp.ZWSP;

const endsWithCaretContainer = (node: Node | null): node is Text =>
  isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;

const trimBogusBr = (elm: Element): void => {
  const brs = elm.getElementsByTagName('br');
  const lastBr = brs[brs.length - 1];
  if (NodeType.isBogus(lastBr)) {
    lastBr.parentNode?.removeChild(lastBr);
  }
};

const showCaretContainerBlock = (caretContainer: Element): Element | null => {
  if (caretContainer && caretContainer.hasAttribute('data-mce-caret')) {
    trimBogusBr(caretContainer);
    caretContainer.removeAttribute('data-mce-caret');
    caretContainer.removeAttribute('data-mce-bogus');
    caretContainer.removeAttribute('style');
    caretContainer.removeAttribute('data-mce-style');
    caretContainer.removeAttribute('_moz_abspos');
    return caretContainer;
  }

  return null;
};

const isRangeInCaretContainerBlock = (range: Range): boolean => isCaretContainerBlock(range.startContainer);

export {
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
  endsWithCaretContainer,
  isRangeInCaretContainerBlock
};
