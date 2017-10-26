/**
 * RangeWalk.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.RangeWalk',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var each = Tools.each;

    var getEndChild = function (container, index) {
      var childNodes = container.childNodes;

      index--;

      if (index > childNodes.length - 1) {
        index = childNodes.length - 1;
      } else if (index < 0) {
        index = 0;
      }

      return childNodes[index] || container;
    };

    var walk = function (dom, rng, callback) {
      var startContainer = rng.startContainer,
        startOffset = rng.startOffset,
        endContainer = rng.endContainer,
        endOffset = rng.endOffset,
        ancestor, startPoint,
        endPoint, node, parent, siblings, nodes;

      // Handle table cell selection the table plugin enables
      // you to fake select table cells and perform formatting actions on them
      nodes = dom.select('td[data-mce-selected],th[data-mce-selected]');
      if (nodes.length > 0) {
        each(nodes, function (node) {
          callback([node]);
        });

        return;
      }

      /**
       * Excludes start/end text node if they are out side the range
       *
       * @private
       * @param {Array} nodes Nodes to exclude items from.
       * @return {Array} Array with nodes excluding the start/end container if needed.
       */
      var exclude = function (nodes) {
        var node;

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

      var collectSiblings = function (node, name, endNode) {
        var siblings = [];

        for (; node && node != endNode; node = node[name]) {
          siblings.push(node);
        }

        return siblings;
      };

      var findEndPoint = function (node, root) {
        do {
          if (node.parentNode === root) {
            return node;
          }

          node = node.parentNode;
        } while (node);
      };

      var walkBoundary = function (startNode, endNode, next) {
        var siblingName = next ? 'nextSibling' : 'previousSibling';

        for (node = startNode, parent = node.parentNode; node && node != endNode; node = parent) {
          parent = node.parentNode;
          siblings = collectSiblings(node === startNode ? node : node[siblingName], siblingName);

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
        startContainer = startContainer.childNodes[startOffset];
      }

      // If index based end position then resolve it
      if (endContainer.nodeType === 1 && endContainer.hasChildNodes()) {
        endContainer = getEndChild(endContainer, endOffset);
      }

      // Same container
      if (startContainer === endContainer) {
        return callback(exclude([startContainer]));
      }

      // Find common ancestor and end points
      ancestor = dom.findCommonAncestor(startContainer, endContainer);

      // Process left side
      for (node = startContainer; node; node = node.parentNode) {
        if (node === endContainer) {
          return walkBoundary(startContainer, ancestor, true);
        }

        if (node === ancestor) {
          break;
        }
      }

      // Process right side
      for (node = endContainer; node; node = node.parentNode) {
        if (node === startContainer) {
          return walkBoundary(endContainer, ancestor);
        }

        if (node === ancestor) {
          break;
        }
      }

      // Find start/end point
      startPoint = findEndPoint(startContainer, ancestor) || startContainer;
      endPoint = findEndPoint(endContainer, ancestor) || endContainer;

      // Walk left leaf
      walkBoundary(startContainer, startPoint, true);

      // Walk the middle from start to end point
      siblings = collectSiblings(
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

    return {
      walk: walk
    };
  }
);
