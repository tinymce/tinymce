import { Type } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';

const matchNodeName = <T extends Node = Node>(name: string) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && node.nodeName.toLowerCase() === name;

const matchNodeNames = <T extends Node = Node>(regex: RegExp) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && regex.test(node.nodeName);

const isTextNode = (node: Node | null): node is Text => Type.isNonNullable(node) && node.nodeType === 3;

const isElement = (node: Node | null): node is Element => Type.isNonNullable(node) && node.nodeType === 1;

const isListNode = matchNodeNames<HTMLOListElement | HTMLUListElement | HTMLDListElement>(/^(OL|UL|DL)$/);

const isOlUlNode = matchNodeNames<HTMLOListElement | HTMLUListElement>(/^(OL|UL)$/);

const isListItemNode = matchNodeNames<HTMLLIElement | HTMLElement>(/^(LI|DT|DD)$/);

const isDlItemNode = matchNodeNames<HTMLElement>(/^(DT|DD)$/);

const isTableCellNode = matchNodeNames<HTMLTableHeaderCellElement | HTMLTableCellElement>(/^(TH|TD)$/);

const isBr = matchNodeName<HTMLBRElement>('br');

const isFirstChild = (node: Node): boolean =>
  node.parentNode?.firstChild === node;

const isLastChild = (node: Node): boolean =>
  node.parentNode?.lastChild === node;

const isTextBlock = (editor: Editor, node: Node | null): node is HTMLElement =>
  Type.isNonNullable(node) && node.nodeName in editor.schema.getTextBlockElements();

const isBlock = (node: Node | null, blockElements: Record<string, any>): boolean =>
  Type.isNonNullable(node) && node.nodeName in blockElements;

const isVoid = (editor: Editor, node: Node | null): boolean =>
  Type.isNonNullable(node) && node.nodeName in editor.schema.getVoidElements();

const isBogusBr = (dom: DOMUtils, node: Node): node is HTMLBRElement => {
  if (!isBr(node)) {
    return false;
  }

  return dom.isBlock(node.nextSibling) && !isBr(node.previousSibling);
};

const isEmpty = (dom: DOMUtils, elm: Element, keepBookmarks?: boolean): boolean => {
  const empty = dom.isEmpty(elm);

  if (keepBookmarks && dom.select('span[data-mce-type=bookmark]', elm).length > 0) {
    return false;
  }

  return empty;
};

const isChildOfBody = (dom: DOMUtils, elm: Element): boolean =>
  dom.isChildOf(elm, dom.getRoot());

export {
  isBlock,
  isBogusBr,
  isBr,
  isChildOfBody,
  isDlItemNode,
  isElement,
  isEmpty,
  isFirstChild,
  isLastChild,
  isListItemNode,
  isListNode,
  isOlUlNode,
  isTableCellNode,
  isTextBlock,
  isTextNode,
  isVoid
};

