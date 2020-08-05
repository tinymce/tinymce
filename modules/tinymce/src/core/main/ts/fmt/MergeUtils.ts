/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import DOMUtils from '../api/dom/DOMUtils';
import ElementUtils from '../api/dom/ElementUtils';
import { FormatVars } from '../api/fmt/Format';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as NodeType from '../dom/NodeType';
import { isCaretNode } from './FormatContainer';
import * as FormatUtils from './FormatUtils';

const each = Tools.each;

const isElementNode = (node: Node) =>
  NodeType.isElement(node) && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);

const findElementSibling = (node: Node, siblingName: 'nextSibling' | 'previousSibling') => {
  let sibling;

  for (sibling = node; sibling; sibling = sibling[siblingName]) {
    if (NodeType.isText(sibling) && sibling.nodeValue.length !== 0) {
      return node;
    }

    if (NodeType.isElement(sibling) && !Bookmarks.isBookmarkNode(sibling)) {
      return sibling;
    }
  }

  return node;
};

const mergeSiblingsNodes = (dom: DOMUtils, prev: Node, next: Node) => {
  let sibling, tmpSibling;
  const elementUtils = new ElementUtils(dom);

  // Check if next/prev exists and that they are elements
  if (prev && next) {
    // If previous sibling is empty then jump over it
    prev = findElementSibling(prev, 'previousSibling');
    next = findElementSibling(next, 'nextSibling');

    // Compare next and previous nodes
    if (elementUtils.compare(prev, next)) {
      // Append nodes between
      for (sibling = prev.nextSibling; sibling && sibling !== next;) {
        tmpSibling = sibling;
        sibling = sibling.nextSibling;
        prev.appendChild(tmpSibling);
      }

      dom.remove(next);

      Tools.each(Tools.grep(next.childNodes), (node) => {
        prev.appendChild(node);
      });

      return prev;
    }
  }

  return next;
};


const mergeSiblings = (dom: DOMUtils, format, vars: FormatVars, node: Node) => {
  // Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
  if (node && format.merge_siblings !== false) {
    // Previous sibling
    const newNode = mergeSiblingsNodes(dom, FormatUtils.getNonWhiteSpaceSibling(node), node);
    // Next sibling
    mergeSiblingsNodes(dom, newNode, FormatUtils.getNonWhiteSpaceSibling(newNode, true));
  }
};

const clearChildStyles = (dom: DOMUtils, format, node: Node) => {
  if (format.clear_child_styles) {
    const selector = format.links ? '*:not(a)' : '*';
    each(dom.select(selector, node), (node) => {
      if (isElementNode(node)) {
        each(format.styles, (value, name) => {
          dom.setStyle(node, name, '');
        });
      }
    });
  }
};

const processChildElements = (node: Node, filter: (node: Node) => boolean, process: (node: Node) => void) => {
  each(node.childNodes, (node) => {
    if (isElementNode(node)) {
      if (filter(node)) {
        process(node);
      }
      if (node.hasChildNodes()) {
        processChildElements(node, filter, process);
      }
    }
  });
};

const unwrapEmptySpan = (dom: DOMUtils, node: Node) => {
  if (node.nodeName === 'SPAN' && dom.getAttribs(node).length === 0) {
    dom.remove(node, true);
  }
};

const hasStyle = (dom: DOMUtils, name: string) => (node: Node): boolean =>
  !!(node && FormatUtils.getStyle(dom, node, name));

const applyStyle = (dom: DOMUtils, name: string, value: string) => (node: Element): void => {
  dom.setStyle(node, name, value);

  if (node.getAttribute('style') === '') {
    node.removeAttribute('style');
  }

  unwrapEmptySpan(dom, node);
};

export {
  applyStyle,
  clearChildStyles,
  hasStyle,
  isElementNode,
  mergeSiblings,
  processChildElements
};
