/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement, Node, Range, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import TextSeeker from '../api/dom/TextSeeker';
import Editor from '../api/Editor';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as NodeType from '../dom/NodeType';
import * as RangeNodes from '../selection/RangeNodes';
import { isContent, isNbsp, isWhiteSpace } from '../text/CharType';
import * as FormatUtils from './FormatUtils';

type Sibling = 'previousSibling' | 'nextSibling';

const isBookmarkNode = Bookmarks.isBookmarkNode;
const getParents = FormatUtils.getParents;
const isWhiteSpaceNode = FormatUtils.isWhiteSpaceNode;
const isTextBlock = FormatUtils.isTextBlock;

const isBogusBr = function (node: Element) {
  return node.nodeName === 'BR' && node.getAttribute('data-mce-bogus') && !node.nextSibling;
};

// Expands the node to the closes contentEditable false element if it exists
const findParentContentEditable = function (dom: DOMUtils, node: Node) {
  let parent = node;

  while (parent) {
    if (NodeType.isElement(parent) && dom.getContentEditable(parent)) {
      return dom.getContentEditable(parent) === 'false' ? parent : node;
    }

    parent = parent.parentNode;
  }

  return node;
};

const walkText = (start: boolean, node: Text, offset: number, predicate: (chr: string) => boolean) => {
  const str = node.data;
  for (let i = offset; start ? i >= 0 : i < str.length; start ? i-- : i++) {
    if (predicate(str.charAt(i))) {
      return start ? i + 1 : i;
    }
  }
  return -1;
};

const findSpace = (start: boolean, node: Text, offset: number) =>
  walkText(start, node, offset, (c) => isNbsp(c) || isWhiteSpace(c));

const findContent = (start: boolean, node: Text, offset: number) =>
  walkText(start, node, offset, isContent);

const findWordEndPoint = (
  dom: DOMUtils,
  body: HTMLElement,
  container: Node,
  offset: number,
  start: boolean,
  includeTrailingSpaces: boolean
) => {
  let lastTextNode: Text;
  const rootNode = dom.getParent(container, dom.isBlock) || body;

  const walk = (container: Node, offset: number, pred: (start: boolean, node: Text, offset?: number) => number) => {
    const textSeeker = TextSeeker(dom);
    const walker = start ? textSeeker.backwards : textSeeker.forwards;
    return Option.from(walker(container, offset, (text, textOffset) => {
      if (isBookmarkNode(text.parentNode)) {
        return -1;
      } else {
        lastTextNode = text;
        return pred(start, text, textOffset);
      }
    }, rootNode));
  };

  const spaceResult = walk(container, offset, findSpace);
  return spaceResult.bind(
    (result) => includeTrailingSpaces ?
      walk(result.container, result.offset + (start ? -1 : 0), findContent) :
      Option.some(result)
  ).orThunk(
    () => lastTextNode ?
      Option.some({ container: lastTextNode, offset: start ? 0 : lastTextNode.length }) :
      Option.none()
  );
};

const findSelectorEndPoint = (dom: DOMUtils, format, rng: Range, container: Node, siblingName: Sibling) => {
  if (NodeType.isText(container) && container.nodeValue.length === 0 && container[siblingName]) {
    container = container[siblingName];
  }

  const parents = getParents(dom, container);
  for (let i = 0; i < parents.length; i++) {
    for (let y = 0; y < format.length; y++) {
      const curFormat = format[y];

      // If collapsed state is set then skip formats that doesn't match that
      if ('collapsed' in curFormat && curFormat.collapsed !== rng.collapsed) {
        continue;
      }

      if (dom.is(parents[i], curFormat.selector)) {
        return parents[i];
      }
    }
  }

  return container;
};

const findBlockEndPoint = (editor: Editor, format, container: Node, siblingName: Sibling) => {
  let node: Node;
  const dom = editor.dom;
  const root = dom.getRoot();

  // Expand to block of similar type
  if (!format[0].wrapper) {
    node = dom.getParent(container, format[0].block, root);
  }

  // Expand to first wrappable block element or any block element
  if (!node) {
    const scopeRoot = dom.getParent(container, 'LI,TD,TH');
    node = dom.getParent(
      NodeType.isText(container) ? container.parentNode : container,
      // Fixes #6183 where it would expand to editable parent element in inline mode
      (node) => node !== root && isTextBlock(editor, node),
      scopeRoot
    );
  }

  // Exclude inner lists from wrapping
  if (node && format[0].wrapper) {
    node = getParents(dom, node, 'ul,ol').reverse()[0] || node;
  }

  // Didn't find a block element look for first/last wrappable element
  if (!node) {
    node = container;

    while (node[siblingName] && !dom.isBlock(node[siblingName])) {
      node = node[siblingName];

      // Break on BR but include it will be removed later on
      // we can't remove it now since we need to check if it can be wrapped
      if (FormatUtils.isEq(node, 'br')) {
        break;
      }
    }
  }

  return node || container;
};

// This function walks up the tree if there is no siblings before/after the node
const findParentContainer = (
  dom: DOMUtils,
  format,
  startContainer: Node,
  startOffset: number,
  endContainer: Node,
  endOffset: number,
  start: boolean
) => {
  let container, parent, sibling;

  container = parent = start ? startContainer : endContainer;
  const siblingName = start ? 'previousSibling' : 'nextSibling';
  const root = dom.getRoot();

  // If it's a text node and the offset is inside the text
  if (NodeType.isText(container) && !isWhiteSpaceNode(container)) {
    if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
      return container;
    }
  }

  /* eslint no-constant-condition:0 */
  while (true) {
    // Stop expanding on block elements
    if (!format[0].block_expand && dom.isBlock(parent)) {
      return parent;
    }

    // Walk left/right
    for (sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
      if (!isBookmarkNode(sibling) && !isWhiteSpaceNode(sibling) && !isBogusBr(sibling)) {
        return parent;
      }
    }

    // Check if we can move up are we at root level or body level
    if (parent === root || parent.parentNode === root) {
      container = parent;
      break;
    }

    parent = parent.parentNode;
  }

  return container;
};

const expandRng = (
  editor: Editor,
  rng: Range,
  format,
  includeTrailingSpace: boolean = false
) => {
  let startContainer = rng.startContainer,
    startOffset = rng.startOffset,
    endContainer = rng.endContainer,
    endOffset = rng.endOffset;
  const dom = editor.dom;

  // If index based start position then resolve it
  if (NodeType.isElement(startContainer) && startContainer.hasChildNodes()) {
    startContainer = RangeNodes.getNode(startContainer, startOffset);
    if (NodeType.isText(startContainer)) {
      startOffset = 0;
    }
  }

  // If index based end position then resolve it
  if (NodeType.isElement(endContainer) && endContainer.hasChildNodes()) {
    endContainer = RangeNodes.getNode(endContainer, rng.collapsed ? endOffset : endOffset - 1);
    if (NodeType.isText(endContainer)) {
      endOffset = endContainer.nodeValue.length;
    }
  }

  // Expand to closest contentEditable element
  startContainer = findParentContentEditable(dom, startContainer);
  endContainer = findParentContentEditable(dom, endContainer);

  // Exclude bookmark nodes if possible
  if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
    startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
    if (rng.collapsed) {
      startContainer = startContainer.previousSibling || startContainer;
    } else {
      startContainer = startContainer.nextSibling || startContainer;
    }

    if (NodeType.isText(startContainer)) {
      startOffset = rng.collapsed ? startContainer.length : 0;
    }
  }

  if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
    endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
    if (rng.collapsed) {
      endContainer = endContainer.nextSibling || endContainer;
    } else {
      endContainer = endContainer.previousSibling || endContainer;
    }

    if (NodeType.isText(endContainer)) {
      endOffset = rng.collapsed ? 0 : endContainer.length;
    }
  }

  if (rng.collapsed) {
    // Expand left to closest word boundary
    const startPoint = findWordEndPoint(
      dom,
      editor.getBody(),
      startContainer,
      startOffset,
      true,
      includeTrailingSpace
    );
    startPoint.each(({ container, offset }) => {
      startContainer = container;
      startOffset = offset;
    });

    // Expand right to closest word boundary
    const endPoint = findWordEndPoint(dom, editor.getBody(), endContainer, endOffset, false, includeTrailingSpace);
    endPoint.each(({ container, offset }) => {
      endContainer = container;
      endOffset = offset;
    });
  }

  // Move start/end point up the tree if the leaves are sharp and if we are in different containers
  // Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
  // This will reduce the number of wrapper elements that needs to be created
  // Move start point up the tree
  if (format[0].inline || format[0].block_expand) {
    if (!format[0].inline || (!NodeType.isText(startContainer) || startOffset === 0)) {
      startContainer = findParentContainer(dom, format, startContainer, startOffset, endContainer, endOffset, true);
    }

    if (!format[0].inline || (!NodeType.isText(endContainer) || endOffset === endContainer.nodeValue.length)) {
      endContainer = findParentContainer(dom, format, startContainer, startOffset, endContainer, endOffset, false);
    }
  }

  // Expand start/end container to matching selector
  if (format[0].selector && format[0].expand !== false && !format[0].inline) {
    // Find new startContainer/endContainer if there is better one
    startContainer = findSelectorEndPoint(dom, format, rng, startContainer, 'previousSibling');
    endContainer = findSelectorEndPoint(dom, format, rng, endContainer, 'nextSibling');
  }

  // Expand start/end container to matching block element or text node
  if (format[0].block || format[0].selector) {
    // Find new startContainer/endContainer if there is better one
    startContainer = findBlockEndPoint(editor, format, startContainer, 'previousSibling');
    endContainer = findBlockEndPoint(editor, format, endContainer, 'nextSibling');

    // Non block element then try to expand up the leaf
    if (format[0].block) {
      if (!dom.isBlock(startContainer)) {
        startContainer = findParentContainer(dom, format, startContainer, startOffset, endContainer, endOffset, true);
      }

      if (!dom.isBlock(endContainer)) {
        endContainer = findParentContainer(dom, format, startContainer, startOffset, endContainer, endOffset, false);
      }
    }
  }

  // Setup index for startContainer
  if (NodeType.isElement(startContainer)) {
    startOffset = dom.nodeIndex(startContainer);
    startContainer = startContainer.parentNode;
  }

  // Setup index for endContainer
  if (NodeType.isElement(endContainer)) {
    endOffset = dom.nodeIndex(endContainer) + 1;
    endContainer = endContainer.parentNode;
  }

  // Return new range like object
  return {
    startContainer,
    startOffset,
    endContainer,
    endOffset
  };
};

export {
  expandRng
};
