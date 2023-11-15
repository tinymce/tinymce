import { Optional } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import DomTreeWalker from '../api/dom/TreeWalker';
import * as CaretContainer from '../caret/CaretContainer';
import { CaretPosition } from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { isCaretNode } from '../fmt/FormatContainer';
import * as RangeCompare from './RangeCompare';

const findParent = (node: Node, rootNode: Node, predicate: (node: Node) => boolean): Node | null => {
  let currentNode: Node | null = node;
  while (currentNode && currentNode !== rootNode) {
    if (predicate(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parentNode;
  }

  return null;
};

const hasParent = (node: Node, rootNode: Node, predicate: (node: Node) => boolean): boolean =>
  findParent(node, rootNode, predicate) !== null;

const hasParentWithName = (node: Node, rootNode: Node, name: string): boolean =>
  hasParent(node, rootNode, (node) => node.nodeName === name);

const isCeFalseCaretContainer = (node: Node, rootNode: Node) => CaretContainer.isCaretContainer(node) && !hasParent(node, rootNode, isCaretNode);

const hasBrBeforeAfter = (dom: DOMUtils, node: Node, left: boolean) => {
  const parentNode = node.parentNode;
  if (parentNode) {
    const walker = new DomTreeWalker(node, dom.getParent(parentNode, dom.isBlock) || dom.getRoot());

    let currentNode: Node | null | undefined;
    while ((currentNode = walker[left ? 'prev' : 'next']())) {
      if (NodeType.isBr(currentNode)) {
        return true;
      }
    }
  }

  return false;
};

const isPrevNode = (node: Node, name: string): boolean =>
  node.previousSibling?.nodeName === name;

const hasContentEditableFalseParent = (root: HTMLElement, node: Node): boolean => {
  let currentNode: Node | null = node;
  while (currentNode && currentNode !== root) {
    if (NodeType.isContentEditableFalse(currentNode)) {
      return true;
    }

    currentNode = currentNode.parentNode;
  }

  return false;
};

// Walks the dom left/right to find a suitable text node to move the endpoint into
// It will only walk within the current parent block or body and will stop if it hits a block or a BR/IMG
const findTextNodeRelative = (dom: DOMUtils, isAfterNode: boolean, collapsed: boolean, left: boolean, startNode: Node): Optional<CaretPosition> => {
  const body = dom.getRoot();
  const nonEmptyElementsMap = dom.schema.getNonEmptyElements();
  const parentNode = startNode.parentNode;
  let lastInlineElement: Node | undefined;
  let node: Node | null | undefined;

  if (!parentNode) {
    return Optional.none();
  }

  const parentBlockContainer = dom.getParent(parentNode, dom.isBlock) || body;

  // Lean left before the BR element if it's the only BR within a block element. Gecko bug: #6680
  // This: <p><br>|</p> becomes <p>|<br></p>
  if (left && NodeType.isBr(startNode) && isAfterNode && dom.isEmpty(parentBlockContainer)) {
    return Optional.some(CaretPosition(parentNode, dom.nodeIndex(startNode)));
  }

  // Walk left until we hit a text node we can move to or a block/br/img
  const walker = new DomTreeWalker(startNode, parentBlockContainer);
  while ((node = walker[left ? 'prev' : 'next']())) {
    // Break if we hit a non content editable node
    if (dom.getContentEditableParent(node) === 'false' || isCeFalseCaretContainer(node, body)) {
      return Optional.none();
    }

    // Found text node that has a length
    if (NodeType.isText(node) && node.data.length > 0) {
      if (!hasParentWithName(node, body, 'A')) {
        return Optional.some(CaretPosition(node, left ? node.data.length : 0));
      }

      return Optional.none();
    }

    // Break if we find a block or a BR/IMG/INPUT etc
    if (dom.isBlock(node) || nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
      return Optional.none();
    }

    lastInlineElement = node;
  }

  if (NodeType.isComment(lastInlineElement)) {
    return Optional.none();
  }

  // Only fetch the last inline element when in caret mode for now
  if (collapsed && lastInlineElement) {
    return Optional.some(CaretPosition(lastInlineElement, 0));
  }

  return Optional.none();
};

const normalizeEndPoint = (dom: DOMUtils, collapsed: boolean, start: boolean, rng: Range): Optional<CaretPosition> => {
  const body = dom.getRoot();
  let node: Node | null | undefined;
  let normalized = false;

  let container: Node | null = start ? rng.startContainer : rng.endContainer;
  let offset = start ? rng.startOffset : rng.endOffset;
  const isAfterNode = NodeType.isElement(container) && offset === container.childNodes.length;
  const nonEmptyElementsMap = dom.schema.getNonEmptyElements();
  let directionLeft = start;

  if (CaretContainer.isCaretContainer(container)) {
    return Optional.none();
  }

  if (NodeType.isElement(container) && offset > container.childNodes.length - 1) {
    directionLeft = false;
  }

  // If the container is a document move it to the body element
  if (NodeType.isDocument(container)) {
    container = body;
    offset = 0;
  }

  // If the container is body try move it into the closest text node or position
  if (container === body) {
    // If start is before/after a image, table etc
    if (directionLeft) {
      node = container.childNodes[offset > 0 ? offset - 1 : 0];
      if (node) {
        if (CaretContainer.isCaretContainer(node)) {
          return Optional.none();
        }

        if (nonEmptyElementsMap[node.nodeName] || NodeType.isTable(node)) {
          return Optional.none();
        }
      }
    }

    // Resolve the index
    if (container.hasChildNodes()) {
      offset = Math.min(!directionLeft && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1);
      container = container.childNodes[offset];
      offset = NodeType.isText(container) && isAfterNode ? container.data.length : 0;

      // Don't normalize non collapsed selections like <p>[a</p><table></table>]
      if (!collapsed && container === body.lastChild && NodeType.isTable(container)) {
        return Optional.none();
      }

      if (hasContentEditableFalseParent(body, container) || CaretContainer.isCaretContainer(container)) {
        return Optional.none();
      }

      if (NodeType.isDetails(container)) {
        return Optional.none();
      }

      // Don't walk into elements that doesn't have any child nodes like a IMG
      if (container.hasChildNodes() && !NodeType.isTable(container)) {
        // Walk the DOM to find a text node to place the caret at or a BR
        node = container;
        const walker = new DomTreeWalker(container, body);

        do {
          if (NodeType.isContentEditableFalse(node) || CaretContainer.isCaretContainer(node)) {
            normalized = false;
            break;
          }

          // Found a text node use that position
          if (NodeType.isText(node) && node.data.length > 0) {
            offset = directionLeft ? 0 : node.data.length;
            container = node;
            normalized = true;
            break;
          }

          // Found a BR/IMG/PRE element that we can place the caret before
          if (nonEmptyElementsMap[node.nodeName.toLowerCase()] && !NodeType.isTableCellOrCaption(node)) {
            offset = dom.nodeIndex(node);
            container = node.parentNode;

            // Put caret after image and pre tag when moving the end point
            if (!directionLeft) {
              offset++;
            }

            normalized = true;
            break;
          }
        } while ((node = (directionLeft ? walker.next() : walker.prev())));
      }
    }
  }

  // Lean the caret to the left if possible
  if (collapsed) {
    // So this: <b>x</b><i>|x</i>
    // Becomes: <b>x|</b><i>x</i>
    // Seems that only gecko has issues with this
    if (NodeType.isText(container) && offset === 0) {
      findTextNodeRelative(dom, isAfterNode, collapsed, true, container).each((pos) => {
        container = pos.container();
        offset = pos.offset();
        normalized = true;
      });
    }

    // Lean left into empty inline elements when the caret is before a BR
    // So this: <i><b></b><i>|<br></i>
    // Becomes: <i><b>|</b><i><br></i>
    // Seems that only gecko has issues with this.
    // Special edge case for <p><a>x</a>|<br></p> since we don't want <p><a>x|</a><br></p>
    if (NodeType.isElement(container)) {
      node = container.childNodes[offset];

      // Offset is after the containers last child
      // then use the previous child for normalization
      if (!node) {
        node = container.childNodes[offset - 1];
      }

      if (node && NodeType.isBr(node) && !isPrevNode(node, 'A') &&
        !hasBrBeforeAfter(dom, node, false) && !hasBrBeforeAfter(dom, node, true)) {
        findTextNodeRelative(dom, isAfterNode, collapsed, true, node).each((pos) => {
          container = pos.container();
          offset = pos.offset();
          normalized = true;
        });
      }
    }
  }

  // Lean the start of the selection right if possible
  // So this: x[<b>x]</b>
  // Becomes: x<b>[x]</b>
  if (directionLeft && !collapsed && NodeType.isText(container) && offset === container.data.length) {
    findTextNodeRelative(dom, isAfterNode, collapsed, false, container).each((pos) => {
      container = pos.container();
      offset = pos.offset();
      normalized = true;
    });
  }

  return normalized && container ? Optional.some(CaretPosition(container, offset)) : Optional.none();
};

const normalize = (dom: DOMUtils, rng: Range): Optional<Range> => {
  const collapsed = rng.collapsed, normRng = rng.cloneRange();
  const startPos = CaretPosition.fromRangeStart(rng);

  normalizeEndPoint(dom, collapsed, true, normRng).each((pos) => {
    // #TINY-1595: Do not move the caret to previous line
    if (!collapsed || !CaretPosition.isAbove(startPos, pos)) {
      normRng.setStart(pos.container(), pos.offset());
    }
  });

  if (!collapsed) {
    normalizeEndPoint(dom, collapsed, false, normRng).each((pos) => {
      normRng.setEnd(pos.container(), pos.offset());
    });
  }

  // If it was collapsed then make sure it still is
  if (collapsed) {
    normRng.collapse(true);
  }

  return RangeCompare.isEq(rng, normRng) ? Optional.none() : Optional.some(normRng);
};

export {
  normalize
};
