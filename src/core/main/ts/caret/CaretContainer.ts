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
import { CaretPosition } from 'tinymce/core/caret/CaretPosition';

/**
 * This module handles caret containers. A caret container is a node that
 * holds the caret for positional purposes.
 *
 * @private
 * @class tinymce.caret.CaretContainer
 */

const isElement = NodeType.isElement;
const isText = NodeType.isText;

const isCaretContainerBlock = (node: Node): boolean => {
  if (isText(node)) {
    node = node.parentNode;
  }

  return isElement(node) && node.hasAttribute('data-mce-caret');
};

const isCaretContainerInline = (node: Node) => isText(node) && Zwsp.isZwsp(node.data);
const isCaretContainer = (node: Node): boolean => isCaretContainerBlock(node) || isCaretContainerInline(node);
const hasContent = (node: Node): boolean => node.firstChild !== node.lastChild || !NodeType.isBr(node.firstChild);

const insertInline = (node: Node, before: boolean): Node => {
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

const prependInline = (node: Node): Node => {
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

const appendInline = (node: Node): Node => {
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
  return pos && NodeType.isText(container) && container.data.charAt(pos.offset()) === Zwsp.ZWSP;
};

const isAfterInline = (pos: CaretPosition): boolean => {
  const container = pos.container();
  return pos && NodeType.isText(container) && container.data.charAt(pos.offset() - 1) === Zwsp.ZWSP;
};

const createBogusBr = (): Element => {
  const br = document.createElement('br');
  br.setAttribute('data-mce-bogus', '1');
  return br;
};

const insertBlock = (blockName: string, node: Node, before: boolean): Node => {
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

const startsWithCaretContainer = (node: Node): boolean => isText(node) && node.data[0] === Zwsp.ZWSP;
const endsWithCaretContainer = (node: Node): boolean => isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;

const trimBogusBr = (elm: Element): void => {
  const brs = elm.getElementsByTagName('br');
  const lastBr = brs[brs.length - 1];
  if (NodeType.isBogus(lastBr)) {
    lastBr.parentNode.removeChild(lastBr);
  }
};

const showCaretContainerBlock = (caretContainer: Element): Element => {
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