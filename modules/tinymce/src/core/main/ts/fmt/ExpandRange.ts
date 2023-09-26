import { Optional, Strings, Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import TextSeeker from '../api/dom/TextSeeker';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as NodeType from '../dom/NodeType';
import * as RangeNodes from '../selection/RangeNodes';
import { RangeLikeObject } from '../selection/RangeTypes';
import { isContent, isNbsp, isWhiteSpace } from '../text/CharType';
import { Format } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

type Sibling = 'previousSibling' | 'nextSibling';

const isBookmarkNode = Bookmarks.isBookmarkNode;
const getParents = FormatUtils.getParents;
const isWhiteSpaceNode = FormatUtils.isWhiteSpaceNode;
const isTextBlock = FormatUtils.isTextBlock;

const isBogusBr = (node: Node) => {
  return NodeType.isBr(node) && node.getAttribute('data-mce-bogus') && !node.nextSibling;
};

// Expands the node to the closes contentEditable false element if it exists
const findParentContentEditable = (dom: DOMUtils, node: Node) => {
  let parent: Node | null = node;

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
  if (start) {
    for (let i = offset; i > 0; i--) {
      if (predicate(str.charAt(i - 1))) {
        return i;
      }
    }
  } else {
    for (let i = offset; i < str.length; i++) {
      if (predicate(str.charAt(i))) {
        return i;
      }
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

  const walk = (container: Node, offset: number, pred: (start: boolean, node: Text, offset: number) => number) => {
    const textSeeker = TextSeeker(dom);
    const walker = start ? textSeeker.backwards : textSeeker.forwards;
    return Optional.from(walker(container, offset, (text, textOffset) => {
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
      Optional.some(result)
  ).orThunk(
    () => lastTextNode ?
      Optional.some({ container: lastTextNode, offset: start ? 0 : lastTextNode.length }) :
      Optional.none()
  );
};

const findSelectorEndPoint = (dom: DOMUtils, formatList: Format[], rng: Range, container: Node, siblingName: Sibling) => {
  const sibling = container[siblingName];
  if (NodeType.isText(container) && Strings.isEmpty(container.data) && sibling) {
    container = sibling;
  }

  const parents = getParents(dom, container);
  for (let i = 0; i < parents.length; i++) {
    for (let y = 0; y < formatList.length; y++) {
      const curFormat = formatList[y];

      // If collapsed state is set then skip formats that doesn't match that
      if (Type.isNonNullable(curFormat.collapsed) && curFormat.collapsed !== rng.collapsed) {
        continue;
      }

      if (FormatUtils.isSelectorFormat(curFormat) && dom.is(parents[i], curFormat.selector)) {
        return parents[i];
      }
    }
  }

  return container;
};

const findBlockEndPoint = (dom: DOMUtils, formatList: Format[], container: Node, siblingName: Sibling) => {
  let node: Node | null = container;
  const root = dom.getRoot();
  const format = formatList[0];

  // Expand to block of similar type
  if (FormatUtils.isBlockFormat(format)) {
    node = format.wrapper ? null : dom.getParent(container, format.block, root);
  }

  // Expand to first wrappable block element or any block element
  if (!node) {
    const scopeRoot = dom.getParent(container, 'LI,TD,TH,SUMMARY') ?? root;
    node = dom.getParent(
      NodeType.isText(container) ? container.parentNode : container,
      // Fixes #6183 where it would expand to editable parent element in inline mode
      (node) => node !== root && isTextBlock(dom.schema, node),
      scopeRoot
    );
  }

  // Exclude inner lists from wrapping
  if (node && FormatUtils.isBlockFormat(format) && format.wrapper) {
    node = getParents(dom, node, 'ul,ol').reverse()[0] || node;
  }

  // Didn't find a block element look for first/last wrappable element
  if (!node) {
    node = container;

    while (node && node[siblingName] && !dom.isBlock(node[siblingName])) {
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

// We're at the edge if the parent is a block and there's no next sibling. Alternatively,
// if we reach the root or can't walk further we also consider it to be a boundary.
const isAtBlockBoundary = (dom: DOMUtils, root: Node, container: Node, siblingName: Sibling): boolean => {
  const parent = container.parentNode;
  if (Type.isNonNullable(container[siblingName])) {
    return false;
  } else if (parent === root || Type.isNullable(parent) || dom.isBlock(parent)) {
    return true;
  } else {
    return isAtBlockBoundary(dom, root, parent, siblingName);
  }
};

// This function walks up the tree if there is no siblings before/after the node.
// If a sibling is found then the container is returned
const findParentContainer = (
  dom: DOMUtils,
  formatList: Format[],
  container: Node,
  offset: number,
  start: boolean
) => {
  let parent: Node | null = container;

  const siblingName = start ? 'previousSibling' : 'nextSibling';
  const root = dom.getRoot();

  // If it's a text node and the offset is inside the text
  if (NodeType.isText(container) && !isWhiteSpaceNode(container)) {
    if (start ? offset > 0 : offset < container.data.length) {
      return container;
    }
  }

  while (parent) {
    // Stop expanding on block elements
    if (!formatList[0].block_expand && dom.isBlock(parent)) {
      return parent;
    }

    // Walk left/right
    for (let sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
      // Allow spaces if not at the edge of a block element, as the spaces won't have been collapsed
      const allowSpaces = NodeType.isText(sibling) && !isAtBlockBoundary(dom, root, sibling, siblingName);
      if (!isBookmarkNode(sibling) && !isBogusBr(sibling) && !isWhiteSpaceNode(sibling, allowSpaces)) {
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

const isSelfOrParentBookmark = (container: Node) => isBookmarkNode(container.parentNode) || isBookmarkNode(container);

const expandRng = (dom: DOMUtils, rng: Range, formatList: Format[], includeTrailingSpace: boolean = false): RangeLikeObject => {
  let { startContainer, startOffset, endContainer, endOffset } = rng;
  const format = formatList[0];

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
      endOffset = endContainer.data.length;
    }
  }

  // Expand to closest contentEditable element
  startContainer = findParentContentEditable(dom, startContainer);
  endContainer = findParentContentEditable(dom, endContainer);

  // Exclude bookmark nodes if possible
  if (isSelfOrParentBookmark(startContainer)) {
    startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode as Node;
    if (rng.collapsed) {
      startContainer = startContainer.previousSibling || startContainer;
    } else {
      startContainer = startContainer.nextSibling || startContainer;
    }

    if (NodeType.isText(startContainer)) {
      startOffset = rng.collapsed ? startContainer.length : 0;
    }
  }

  if (isSelfOrParentBookmark(endContainer)) {
    endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode as Node;
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
      dom.getRoot(),
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
    const endPoint = findWordEndPoint(dom, dom.getRoot(), endContainer, endOffset, false, includeTrailingSpace);
    endPoint.each(({ container, offset }) => {
      endContainer = container;
      endOffset = offset;
    });
  }

  // Move start/end point up the tree if the leaves are sharp and if we are in different containers
  // Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
  // This will reduce the number of wrapper elements that needs to be created
  // Move start point up the tree
  if (FormatUtils.isInlineFormat(format) || format.block_expand) {
    if (!FormatUtils.isInlineFormat(format) || (!NodeType.isText(startContainer) || startOffset === 0)) {
      startContainer = findParentContainer(dom, formatList, startContainer, startOffset, true);
    }

    if (!FormatUtils.isInlineFormat(format) || (!NodeType.isText(endContainer) || endOffset === endContainer.data.length)) {
      endContainer = findParentContainer(dom, formatList, endContainer, endOffset, false);
    }
  }

  // Expand start/end container to matching selector
  if (FormatUtils.shouldExpandToSelector(format)) {
    // Find new startContainer/endContainer if there is better one
    startContainer = findSelectorEndPoint(dom, formatList, rng, startContainer, 'previousSibling');
    endContainer = findSelectorEndPoint(dom, formatList, rng, endContainer, 'nextSibling');
  }

  // Expand start/end container to matching block element or text node
  if (FormatUtils.isBlockFormat(format) || FormatUtils.isSelectorFormat(format)) {
    // Find new startContainer/endContainer if there is better one
    startContainer = findBlockEndPoint(dom, formatList, startContainer, 'previousSibling');
    endContainer = findBlockEndPoint(dom, formatList, endContainer, 'nextSibling');

    // Non block element then try to expand up the leaf
    if (FormatUtils.isBlockFormat(format)) {
      if (!dom.isBlock(startContainer)) {
        startContainer = findParentContainer(dom, formatList, startContainer, startOffset, true);
      }

      if (!dom.isBlock(endContainer)) {
        endContainer = findParentContainer(dom, formatList, endContainer, endOffset, false);
      }
    }
  }

  // Setup index for startContainer
  if (NodeType.isElement(startContainer) && startContainer.parentNode) {
    startOffset = dom.nodeIndex(startContainer);
    startContainer = startContainer.parentNode;
  }

  // Setup index for endContainer
  if (NodeType.isElement(endContainer) && endContainer.parentNode) {
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
