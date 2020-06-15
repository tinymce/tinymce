/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node, Range } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import TreeWalker from '../api/dom/TreeWalker';
import * as CaretContainer from '../caret/CaretContainer';
import { CaretPosition } from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { isCaretNode } from '../fmt/FormatContainer';
import * as RangeCompare from './RangeCompare';

const findParent = (node: Node, rootNode: Node, predicate: (node: Node) => boolean) => {
  while (node && node !== rootNode) {
    if (predicate(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const hasParent = (node: Node, rootNode: Node, predicate: (node: Node) => boolean) => findParent(node, rootNode, predicate) !== null;

const hasParentWithName = (node: Node, rootNode: Node, name: string) => hasParent(node, rootNode, function (node) {
  return node.nodeName === name;
});

const isTable = (node: Node) => node && node.nodeName === 'TABLE';

const isTableCell = (node: Node) => node && /^(TD|TH|CAPTION)$/.test(node.nodeName);

const isCeFalseCaretContainer = (node: Node, rootNode: Node) => CaretContainer.isCaretContainer(node) && hasParent(node, rootNode, isCaretNode) === false;

const hasBrBeforeAfter = (dom: DOMUtils, node: Node, left: boolean) => {
  const walker = new TreeWalker(node, dom.getParent(node.parentNode, dom.isBlock) || dom.getRoot());

  while ((node = walker[left ? 'prev' : 'next']())) {
    if (NodeType.isBr(node)) {
      return true;
    }
  }
};

const isPrevNode = (node: Node, name: string) => node.previousSibling && node.previousSibling.nodeName === name;

const hasContentEditableFalseParent = (body: HTMLElement, node: Node) => {
  while (node && node !== body) {
    if (NodeType.isContentEditableFalse(node)) {
      return true;
    }

    node = node.parentNode;
  }

  return false;
};

// Walks the dom left/right to find a suitable text node to move the endpoint into
// It will only walk within the current parent block or body and will stop if it hits a block or a BR/IMG
const findTextNodeRelative = (dom: DOMUtils, isAfterNode: boolean, collapsed: boolean, left: boolean, startNode: Node): Option<CaretPosition> => {
  let lastInlineElement;
  const body = dom.getRoot();
  let node;
  const nonEmptyElementsMap = dom.schema.getNonEmptyElements();

  const parentBlockContainer = dom.getParent(startNode.parentNode, dom.isBlock) || body;

  // Lean left before the BR element if it's the only BR within a block element. Gecko bug: #6680
  // This: <p><br>|</p> becomes <p>|<br></p>
  if (left && NodeType.isBr(startNode) && isAfterNode && dom.isEmpty(parentBlockContainer)) {
    return Option.some(CaretPosition(startNode.parentNode, dom.nodeIndex(startNode)));
  }

  // Walk left until we hit a text node we can move to or a block/br/img
  const walker = new TreeWalker(startNode, parentBlockContainer);
  while ((node = walker[left ? 'prev' : 'next']())) {
    // Break if we hit a non content editable node
    if (dom.getContentEditableParent(node) === 'false' || isCeFalseCaretContainer(node, body)) {
      return Option.none();
    }

    // Found text node that has a length
    if (NodeType.isText(node) && node.nodeValue.length > 0) {
      if (hasParentWithName(node, body, 'A') === false) {
        return Option.some(CaretPosition(node, left ? node.nodeValue.length : 0));
      }

      return Option.none();
    }

    // Break if we find a block or a BR/IMG/INPUT etc
    if (dom.isBlock(node) || nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
      return Option.none();
    }

    lastInlineElement = node;
  }

  // Only fetch the last inline element when in caret mode for now
  if (collapsed && lastInlineElement) {
    return Option.some(CaretPosition(lastInlineElement, 0));
  }

  return Option.none();
};

const normalizeEndPoint = (dom: DOMUtils, collapsed: boolean, start: boolean, rng: Range): Option<CaretPosition> => {
  let container, offset;
  const body = dom.getRoot();
  let node;
  let directionLeft, normalized = false;

  container = rng[(start ? 'start' : 'end') + 'Container'];
  offset = rng[(start ? 'start' : 'end') + 'Offset'];
  const isAfterNode = NodeType.isElement(container) && offset === container.childNodes.length;
  const nonEmptyElementsMap = dom.schema.getNonEmptyElements();
  directionLeft = start;

  if (CaretContainer.isCaretContainer(container)) {
    return Option.none();
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
          return Option.none();
        }

        if (nonEmptyElementsMap[node.nodeName] || isTable(node)) {
          return Option.none();
        }
      }
    }

    // Resolve the index
    if (container.hasChildNodes()) {
      offset = Math.min(!directionLeft && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1);
      container = container.childNodes[offset];
      offset = NodeType.isText(container) && isAfterNode ? container.data.length : 0;

      // Don't normalize non collapsed selections like <p>[a</p><table></table>]
      if (!collapsed && container === body.lastChild && isTable(container)) {
        return Option.none();
      }

      if (hasContentEditableFalseParent(body, container) || CaretContainer.isCaretContainer(container)) {
        return Option.none();
      }

      // Don't walk into elements that doesn't have any child nodes like a IMG
      if (container.hasChildNodes() && isTable(container) === false) {
        // Walk the DOM to find a text node to place the caret at or a BR
        node = container;
        const walker = new TreeWalker(container, body);

        do {
          if (NodeType.isContentEditableFalse(node) || CaretContainer.isCaretContainer(node)) {
            normalized = false;
            break;
          }

          // Found a text node use that position
          if (NodeType.isText(node) && node.nodeValue.length > 0) {
            offset = directionLeft ? 0 : node.nodeValue.length;
            container = node;
            normalized = true;
            break;
          }

          // Found a BR/IMG/PRE element that we can place the caret before
          if (nonEmptyElementsMap[node.nodeName.toLowerCase()] && !isTableCell(node)) {
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
      findTextNodeRelative(dom, isAfterNode, collapsed, true, container).each(function (pos) {
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
        findTextNodeRelative(dom, isAfterNode, collapsed, true, node).each(function (pos) {
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
  if (directionLeft && !collapsed && NodeType.isText(container) && offset === container.nodeValue.length) {
    findTextNodeRelative(dom, isAfterNode, collapsed, false, container).each(function (pos) {
      container = pos.container();
      offset = pos.offset();
      normalized = true;
    });
  }

  return normalized ? Option.some(CaretPosition(container, offset)) : Option.none();
};

const normalize = (dom: DOMUtils, rng: Range): Option<Range> => {
  const collapsed = rng.collapsed, normRng = rng.cloneRange();
  const startPos = CaretPosition.fromRangeStart(rng);

  normalizeEndPoint(dom, collapsed, true, normRng).each(function (pos) {
    // #TINY-1595: Do not move the caret to previous line
    if (!collapsed || !CaretPosition.isAbove(startPos, pos)) {
      normRng.setStart(pos.container(), pos.offset());
    }
  });

  if (!collapsed) {
    normalizeEndPoint(dom, collapsed, false, normRng).each(function (pos) {
      normRng.setEnd(pos.container(), pos.offset());
    });
  }

  // If it was collapsed then make sure it still is
  if (collapsed) {
    normRng.collapse(true);
  }

  return RangeCompare.isEq(rng, normRng) ? Option.none() : Option.some(normRng);
};

export {
  normalize
};
