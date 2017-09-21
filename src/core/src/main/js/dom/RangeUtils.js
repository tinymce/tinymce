/**
 * RangeUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains a few utility methods for ranges.
 *
 * @class tinymce.dom.RangeUtils
 */
define(
  'tinymce.core.dom.RangeUtils',
  [
    "tinymce.core.util.Tools",
    "tinymce.core.dom.TreeWalker",
    "tinymce.core.dom.NodeType",
    "tinymce.core.dom.Range",
    "tinymce.core.caret.CaretContainer"
  ],
  function (Tools, TreeWalker, NodeType, Range, CaretContainer) {
    var each = Tools.each,
      isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isCaretContainer = CaretContainer.isCaretContainer;

    function hasCeProperty(node) {
      return isContentEditableTrue(node) || isContentEditableFalse(node);
    }

    function getEndChild(container, index) {
      var childNodes = container.childNodes;

      index--;

      if (index > childNodes.length - 1) {
        index = childNodes.length - 1;
      } else if (index < 0) {
        index = 0;
      }

      return childNodes[index] || container;
    }

    function findParent(node, rootNode, predicate) {
      while (node && node !== rootNode) {
        if (predicate(node)) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    }

    function hasParent(node, rootNode, predicate) {
      return findParent(node, rootNode, predicate) !== null;
    }

    function hasParentWithName(node, rootNode, name) {
      return hasParent(node, rootNode, function (node) {
        return node.nodeName === name;
      });
    }

    function isFormatterCaret(node) {
      return node.id === '_mce_caret';
    }

    function isCeFalseCaretContainer(node, rootNode) {
      return isCaretContainer(node) && hasParent(node, rootNode, isFormatterCaret) === false;
    }

    function RangeUtils(dom) {
      /**
       * Walks the specified range like object and executes the callback for each sibling collection it finds.
       *
       * @private
       * @method walk
       * @param {Object} rng Range like object.
       * @param {function} callback Callback function to execute for each sibling collection.
       */
      this.walk = function (rng, callback) {
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
        function exclude(nodes) {
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
        }

        /**
         * Collects siblings
         *
         * @private
         * @param {Node} node Node to collect siblings from.
         * @param {String} name Name of the sibling to check for.
         * @param {Node} endNode
         * @return {Array} Array of collected siblings.
         */
        function collectSiblings(node, name, endNode) {
          var siblings = [];

          for (; node && node != endNode; node = node[name]) {
            siblings.push(node);
          }

          return siblings;
        }

        /**
         * Find an end point this is the node just before the common ancestor root.
         *
         * @private
         * @param {Node} node Node to start at.
         * @param {Node} root Root/ancestor element to stop just before.
         * @return {Node} Node just before the root element.
         */
        function findEndPoint(node, root) {
          do {
            if (node.parentNode == root) {
              return node;
            }

            node = node.parentNode;
          } while (node);
        }

        function walkBoundary(startNode, endNode, next) {
          var siblingName = next ? 'nextSibling' : 'previousSibling';

          for (node = startNode, parent = node.parentNode; node && node != endNode; node = parent) {
            parent = node.parentNode;
            siblings = collectSiblings(node == startNode ? node : node[siblingName], siblingName);

            if (siblings.length) {
              if (!next) {
                siblings.reverse();
              }

              callback(exclude(siblings));
            }
          }
        }

        // If index based start position then resolve it
        if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
          startContainer = startContainer.childNodes[startOffset];
        }

        // If index based end position then resolve it
        if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
          endContainer = getEndChild(endContainer, endOffset);
        }

        // Same container
        if (startContainer == endContainer) {
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
          startPoint == startContainer ? startPoint : startPoint.nextSibling,
          'nextSibling',
          endPoint == endContainer ? endPoint.nextSibling : endPoint
        );

        if (siblings.length) {
          callback(exclude(siblings));
        }

        // Walk right leaf
        walkBoundary(endContainer, endPoint);
      };

      /**
       * Splits the specified range at it's start/end points.
       *
       * @private
       * @param {Range/RangeObject} rng Range to split.
       * @return {Object} Range position object.
       */
      this.split = function (rng) {
        var startContainer = rng.startContainer,
          startOffset = rng.startOffset,
          endContainer = rng.endContainer,
          endOffset = rng.endOffset;

        function splitText(node, offset) {
          return node.splitText(offset);
        }

        // Handle single text node
        if (startContainer == endContainer && startContainer.nodeType == 3) {
          if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
            endContainer = splitText(startContainer, startOffset);
            startContainer = endContainer.previousSibling;

            if (endOffset > startOffset) {
              endOffset = endOffset - startOffset;
              startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
              endOffset = endContainer.nodeValue.length;
              startOffset = 0;
            } else {
              endOffset = 0;
            }
          }
        } else {
          // Split startContainer text node if needed
          if (startContainer.nodeType == 3 && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
            startContainer = splitText(startContainer, startOffset);
            startOffset = 0;
          }

          // Split endContainer text node if needed
          if (endContainer.nodeType == 3 && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
            endContainer = splitText(endContainer, endOffset).previousSibling;
            endOffset = endContainer.nodeValue.length;
          }
        }

        return {
          startContainer: startContainer,
          startOffset: startOffset,
          endContainer: endContainer,
          endOffset: endOffset
        };
      };

      /**
       * Normalizes the specified range by finding the closest best suitable caret location.
       *
       * @private
       * @param {Range} rng Range to normalize.
       * @return {Boolean} True/false if the specified range was normalized or not.
       */
      this.normalize = function (rng) {
        var normalized = false, collapsed;

        function normalizeEndPoint(start) {
          var container, offset, walker, body = dom.getRoot(), node, nonEmptyElementsMap;
          var directionLeft, isAfterNode;

          function isTableCell(node) {
            return node && /^(TD|TH|CAPTION)$/.test(node.nodeName);
          }

          function hasBrBeforeAfter(node, left) {
            var walker = new TreeWalker(node, dom.getParent(node.parentNode, dom.isBlock) || body);

            while ((node = walker[left ? 'prev' : 'next']())) {
              if (node.nodeName === "BR") {
                return true;
              }
            }
          }

          function hasContentEditableFalseParent(node) {
            while (node && node != body) {
              if (isContentEditableFalse(node)) {
                return true;
              }

              node = node.parentNode;
            }

            return false;
          }

          function isPrevNode(node, name) {
            return node.previousSibling && node.previousSibling.nodeName == name;
          }

          // Walks the dom left/right to find a suitable text node to move the endpoint into
          // It will only walk within the current parent block or body and will stop if it hits a block or a BR/IMG
          function findTextNodeRelative(left, startNode) {
            var walker, lastInlineElement, parentBlockContainer;

            startNode = startNode || container;
            parentBlockContainer = dom.getParent(startNode.parentNode, dom.isBlock) || body;

            // Lean left before the BR element if it's the only BR within a block element. Gecko bug: #6680
            // This: <p><br>|</p> becomes <p>|<br></p>
            if (left && startNode.nodeName == 'BR' && isAfterNode && dom.isEmpty(parentBlockContainer)) {
              container = startNode.parentNode;
              offset = dom.nodeIndex(startNode);
              normalized = true;
              return;
            }

            // Walk left until we hit a text node we can move to or a block/br/img
            walker = new TreeWalker(startNode, parentBlockContainer);
            while ((node = walker[left ? 'prev' : 'next']())) {
              // Break if we hit a non content editable node
              if (dom.getContentEditableParent(node) === "false" || isCeFalseCaretContainer(node, dom.getRoot())) {
                return;
              }

              // Found text node that has a length
              if (node.nodeType === 3 && node.nodeValue.length > 0) {
                if (hasParentWithName(node, body, 'A') === false) {
                  container = node;
                  offset = left ? node.nodeValue.length : 0;
                  normalized = true;
                }

                return;
              }

              // Break if we find a block or a BR/IMG/INPUT etc
              if (dom.isBlock(node) || nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
                return;
              }

              lastInlineElement = node;
            }

            // Only fetch the last inline element when in caret mode for now
            if (collapsed && lastInlineElement) {
              container = lastInlineElement;
              normalized = true;
              offset = 0;
            }
          }

          container = rng[(start ? 'start' : 'end') + 'Container'];
          offset = rng[(start ? 'start' : 'end') + 'Offset'];
          isAfterNode = container.nodeType == 1 && offset === container.childNodes.length;
          nonEmptyElementsMap = dom.schema.getNonEmptyElements();
          directionLeft = start;

          if (isCaretContainer(container)) {
            return;
          }

          if (container.nodeType == 1 && offset > container.childNodes.length - 1) {
            directionLeft = false;
          }

          // If the container is a document move it to the body element
          if (container.nodeType === 9) {
            container = dom.getRoot();
            offset = 0;
          }

          // If the container is body try move it into the closest text node or position
          if (container === body) {
            // If start is before/after a image, table etc
            if (directionLeft) {
              node = container.childNodes[offset > 0 ? offset - 1 : 0];
              if (node) {
                if (isCaretContainer(node)) {
                  return;
                }

                if (nonEmptyElementsMap[node.nodeName] || node.nodeName == "TABLE") {
                  return;
                }
              }
            }

            // Resolve the index
            if (container.hasChildNodes()) {
              offset = Math.min(!directionLeft && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1);
              container = container.childNodes[offset];
              offset = 0;

              // Don't normalize non collapsed selections like <p>[a</p><table></table>]
              if (!collapsed && container === body.lastChild && container.nodeName === 'TABLE') {
                return;
              }

              if (hasContentEditableFalseParent(container) || isCaretContainer(container)) {
                return;
              }

              // Don't walk into elements that doesn't have any child nodes like a IMG
              if (container.hasChildNodes() && !/TABLE/.test(container.nodeName)) {
                // Walk the DOM to find a text node to place the caret at or a BR
                node = container;
                walker = new TreeWalker(container, body);

                do {
                  if (isContentEditableFalse(node) || isCaretContainer(node)) {
                    normalized = false;
                    break;
                  }

                  // Found a text node use that position
                  if (node.nodeType === 3 && node.nodeValue.length > 0) {
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
                    if ((node.nodeName === "IMG" || node.nodeName === "PRE") && !directionLeft) {
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
            if (container.nodeType === 3 && offset === 0) {
              findTextNodeRelative(true);
            }

            // Lean left into empty inline elements when the caret is before a BR
            // So this: <i><b></b><i>|<br></i>
            // Becomes: <i><b>|</b><i><br></i>
            // Seems that only gecko has issues with this.
            // Special edge case for <p><a>x</a>|<br></p> since we don't want <p><a>x|</a><br></p>
            if (container.nodeType === 1) {
              node = container.childNodes[offset];

              // Offset is after the containers last child
              // then use the previous child for normalization
              if (!node) {
                node = container.childNodes[offset - 1];
              }

              if (node && node.nodeName === 'BR' && !isPrevNode(node, 'A') &&
                !hasBrBeforeAfter(node) && !hasBrBeforeAfter(node, true)) {
                findTextNodeRelative(true, node);
              }
            }
          }

          // Lean the start of the selection right if possible
          // So this: x[<b>x]</b>
          // Becomes: x<b>[x]</b>
          if (directionLeft && !collapsed && container.nodeType === 3 && offset === container.nodeValue.length) {
            findTextNodeRelative(false);
          }

          // Set endpoint if it was normalized
          if (normalized) {
            rng['set' + (start ? 'Start' : 'End')](container, offset);
          }
        }

        collapsed = rng.collapsed;

        normalizeEndPoint(true);

        if (!collapsed) {
          normalizeEndPoint();
        }

        // If it was collapsed then make sure it still is
        if (normalized && collapsed) {
          rng.collapse(true);
        }

        return normalized;
      };
    }

    /**
     * Compares two ranges and checks if they are equal.
     *
     * @static
     * @method compareRanges
     * @param {DOMRange} rng1 First range to compare.
     * @param {DOMRange} rng2 First range to compare.
     * @return {Boolean} true/false if the ranges are equal.
     */
    RangeUtils.compareRanges = function (rng1, rng2) {
      if (rng1 && rng2) {
        // Compare native IE ranges
        if (rng1.item || rng1.duplicate) {
          // Both are control ranges and the selected element matches
          if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0)) {
            return true;
          }

          // Both are text ranges and the range matches
          if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1)) {
            return true;
          }
        } else {
          // Compare w3c ranges
          return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
        }
      }

      return false;
    };

    /**
     * Finds the closest selection rect tries to get the range from that.
     */
    function findClosestIeRange(clientX, clientY, doc) {
      var element, rng, rects;

      element = doc.elementFromPoint(clientX, clientY);
      rng = doc.body.createTextRange();

      if (!element || element.tagName == 'HTML') {
        element = doc.body;
      }

      rng.moveToElementText(element);
      rects = Tools.toArray(rng.getClientRects());

      rects = rects.sort(function (a, b) {
        a = Math.abs(Math.max(a.top - clientY, a.bottom - clientY));
        b = Math.abs(Math.max(b.top - clientY, b.bottom - clientY));

        return a - b;
      });

      if (rects.length > 0) {
        clientY = (rects[0].bottom + rects[0].top) / 2;

        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);

          return rng;
        } catch (ex) {
          // At least we tried
        }
      }

      return null;
    }

    function moveOutOfContentEditableFalse(rng, rootNode) {
      var parentElement = rng && rng.parentElement ? rng.parentElement() : null;
      return isContentEditableFalse(findParent(parentElement, rootNode, hasCeProperty)) ? null : rng;
    }

    /**
     * Gets the caret range for the given x/y location.
     *
     * @static
     * @method getCaretRangeFromPoint
     * @param {Number} clientX X coordinate for range
     * @param {Number} clientY Y coordinate for range
     * @param {Document} doc Document that x/y are relative to
     * @returns {Range} caret range
     */
    RangeUtils.getCaretRangeFromPoint = function (clientX, clientY, doc) {
      var rng, point;

      if (doc.caretPositionFromPoint) {
        point = doc.caretPositionFromPoint(clientX, clientY);
        rng = doc.createRange();
        rng.setStart(point.offsetNode, point.offset);
        rng.collapse(true);
      } else if (doc.caretRangeFromPoint) {
        rng = doc.caretRangeFromPoint(clientX, clientY);
      } else if (doc.body.createTextRange) {
        rng = doc.body.createTextRange();

        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);
        } catch (ex) {
          rng = findClosestIeRange(clientX, clientY, doc);
        }

        return moveOutOfContentEditableFalse(rng, doc.body);
      }

      return rng;
    };

    RangeUtils.getSelectedNode = function (range) {
      var startContainer = range.startContainer,
        startOffset = range.startOffset;

      if (startContainer.hasChildNodes() && range.endOffset == startOffset + 1) {
        return startContainer.childNodes[startOffset];
      }

      return null;
    };

    RangeUtils.getNode = function (container, offset) {
      if (container.nodeType === 1 && container.hasChildNodes()) {
        if (offset >= container.childNodes.length) {
          offset = container.childNodes.length - 1;
        }

        container = container.childNodes[offset];
      }

      return container;
    };

    return RangeUtils;
  }
);
