/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import DOMUtils from '../api/dom/DOMUtils';
import { RangeLikeObject } from './RangeTypes';

const clampToExistingChildren = (container: Node, index: number) => {
  const childNodes = container.childNodes;

  if (index >= childNodes.length) {
    index = childNodes.length - 1;
  } else if (index < 0) {
    index = 0;
  }

  return childNodes[index] || container;
};

const getEndChild = (container: Node, index: number) => clampToExistingChildren(container, index - 1);

const walk = (dom: DOMUtils, rng: RangeLikeObject, callback: (nodes: Node[]) => void) => {
  let startContainer = rng.startContainer;
  const startOffset = rng.startOffset;
  let endContainer = rng.endContainer;
  const endOffset = rng.endOffset;

  /**
   * Excludes start/end text node if they are out side the range
   *
   * @private
   * @param {Array} nodes Nodes to exclude items from.
   * @return {Array} Array with nodes excluding the start/end container if needed.
   */
  const exclude = function (nodes: Node[]) {
    let node;

    // First node is excluded
    node = nodes[0];
    if (node.nodeType === 3 && node === startContainer && startOffset >= node.nodeValue.length) {
      nodes.splice(0, 1);
    }

    // Last node is excluded
    node = nodes[nodes.length - 1];
    if (endOffset === 0 && nodes.length > 0 && node === endContainer && node.nodeType === 3) {
      nodes.splice(nodes.length - 1, 1);
    }

    return nodes;
  };

  const collectSiblings = function (node: Node, name: string, endNode?: Node) {
    const siblings = [];

    for (; node && node !== endNode; node = node[name]) {
      siblings.push(node);
    }

    return siblings;
  };

  const findEndPoint = function (node: Node, root: Node) {
    do {
      if (node.parentNode === root) {
        return node;
      }

      node = node.parentNode;
    } while (node);
  };

  const walkBoundary = function (startNode: Node, endNode: Node, next?: boolean) {
    const siblingName = next ? 'nextSibling' : 'previousSibling';

    for (let node = startNode, parent = node.parentNode; node && node !== endNode; node = parent) {
      parent = node.parentNode;
      const siblings = collectSiblings(node === startNode ? node : node[siblingName], siblingName);

      if (siblings.length) {
        if (!next) {
          siblings.reverse();
        }

        callback(exclude(siblings));
      }
    }
  };

  // If index based start position then resolve it
  if (startContainer.nodeType === 1 && startContainer.hasChildNodes()) {
    startContainer = clampToExistingChildren(startContainer, startOffset);
  }

  // If index based end position then resolve it
  if (endContainer.nodeType === 1 && endContainer.hasChildNodes()) {
    endContainer = getEndChild(endContainer, endOffset);
  }

  // Same container
  if (startContainer === endContainer) {
    return callback(exclude([ startContainer ]));
  }

  // Find common ancestor and end points
  const ancestor = dom.findCommonAncestor(startContainer, endContainer);

  // Process left side
  for (let node = startContainer; node; node = node.parentNode) {
    if (node === endContainer) {
      return walkBoundary(startContainer, ancestor, true);
    }

    if (node === ancestor) {
      break;
    }
  }

  // Process right side
  for (let node = endContainer; node; node = node.parentNode) {
    if (node === startContainer) {
      return walkBoundary(endContainer, ancestor);
    }

    if (node === ancestor) {
      break;
    }
  }

  // Find start/end point
  const startPoint = findEndPoint(startContainer, ancestor) || startContainer;
  const endPoint = findEndPoint(endContainer, ancestor) || endContainer;

  // Walk left leaf
  walkBoundary(startContainer, startPoint, true);

  // Walk the middle from start to end point
  const siblings = collectSiblings(
    startPoint === startContainer ? startPoint : startPoint.nextSibling,
    'nextSibling',
    endPoint === endContainer ? endPoint.nextSibling : endPoint
  );

  if (siblings.length) {
    callback(exclude(siblings));
  }

  // Walk right leaf
  walkBoundary(endContainer, endPoint);
};

export {
  walk
};
