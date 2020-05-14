/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLBRElement, HTMLDListElement, HTMLElement, HTMLLIElement, HTMLOListElement, HTMLTableCellElement, HTMLTableHeaderCellElement, HTMLUListElement, Node, Text } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

const matchNodeName = <T extends Node = Node>(name: string) => (node: Node): node is T => node && node.nodeName.toLowerCase() === name;
const matchNodeNames = <T extends Node = Node>(regex: RegExp) => (node: Node): node is T => node && regex.test(node.nodeName);

const isTextNode = (node: Node): node is Text => node && node.nodeType === 3;

const isListNode = matchNodeNames<HTMLOListElement | HTMLUListElement | HTMLDListElement>(/^(OL|UL|DL)$/);

const isOlUlNode = matchNodeNames<HTMLOListElement | HTMLUListElement>(/^(OL|UL)$/);

const isOlNode = matchNodeName<HTMLOListElement>('ol');

const isListItemNode = matchNodeNames<HTMLLIElement | HTMLElement>(/^(LI|DT|DD)$/);

const isDlItemNode = matchNodeNames<HTMLElement>(/^(DT|DD)$/);

const isTableCellNode = matchNodeNames<HTMLTableHeaderCellElement | HTMLTableCellElement>(/^(TH|TD)$/);

const isBr = matchNodeName<HTMLBRElement>('br');

const isFirstChild = (node: Node) => node.parentNode.firstChild === node;

const isLastChild = (node: Node) => node.parentNode.lastChild === node;

const isTextBlock = (editor: Editor, node: Node) => node && !!editor.schema.getTextBlockElements()[node.nodeName];

const isBlock = (node: Node, blockElements: Record<string, any>) => node && node.nodeName in blockElements;

const isBogusBr = (dom: DOMUtils, node: Node) => {
  if (!isBr(node)) {
    return false;
  }

  if (dom.isBlock(node.nextSibling) && !isBr(node.previousSibling)) {
    return true;
  }

  return false;
};

const isEmpty = (dom: DOMUtils, elm: Node, keepBookmarks?: boolean) => {
  const empty = dom.isEmpty(elm);

  if (keepBookmarks && dom.select('span[data-mce-type=bookmark]', elm).length > 0) {
    return false;
  }

  return empty;
};

const isChildOfBody = (dom: DOMUtils, elm: Element) => dom.isChildOf(elm, dom.getRoot());

export {
  isTextNode,
  isListNode,
  isOlUlNode,
  isOlNode,
  isDlItemNode,
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
