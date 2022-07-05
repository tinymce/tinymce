import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import * as RangeNodes from './RangeNodes';
import { RangeLikeObject } from './RangeTypes';

const walk = (dom: DOMUtils, rng: RangeLikeObject, callback: (nodes: Node[]) => void): void => {
  const startOffset = rng.startOffset;
  const startContainer = RangeNodes.getNode(rng.startContainer, startOffset);
  const endOffset = rng.endOffset;
  const endContainer = RangeNodes.getNode(rng.endContainer, endOffset - 1);

  /**
   * Excludes start/end text node if they are out side the range
   *
   * @private
   * @param {Array} nodes Nodes to exclude items from.
   * @return {Array} Array with nodes excluding the start/end container if needed.
   */
  const exclude = (nodes: Node[]) => {
    // First node is excluded
    const firstNode = nodes[0];
    if (NodeType.isText(firstNode) && firstNode === startContainer && startOffset >= firstNode.data.length) {
      nodes.splice(0, 1);
    }

    // Last node is excluded
    const lastNode = nodes[nodes.length - 1];
    if (endOffset === 0 && nodes.length > 0 && lastNode === endContainer && NodeType.isText(lastNode)) {
      nodes.splice(nodes.length - 1, 1);
    }

    return nodes;
  };

  const collectSiblings = (node: Node | null, name: 'nextSibling' | 'previousSibling', endNode?: Node | null) => {
    const siblings = [];

    for (; node && node !== endNode; node = node[name]) {
      siblings.push(node);
    }

    return siblings;
  };

  const findEndPoint = (node: Node, root: Node) =>
    dom.getParent(node, (node) => node.parentNode === root, root);

  const walkBoundary = (startNode: Node, endNode: Node, next?: boolean) => {
    const siblingName = next ? 'nextSibling' : 'previousSibling';

    for (let node: Node | null = startNode, parent = node.parentNode; node && node !== endNode; node = parent) {
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

  // Same container
  if (startContainer === endContainer) {
    return callback(exclude([ startContainer ]));
  }

  // Find common ancestor and end points
  const ancestor = dom.findCommonAncestor(startContainer, endContainer) ?? dom.getRoot();

  // Process left side
  if (dom.isChildOf(startContainer, endContainer)) {
    return walkBoundary(startContainer, ancestor, true);
  }

  // Process right side
  if (dom.isChildOf(endContainer, startContainer)) {
    return walkBoundary(endContainer, ancestor);
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
