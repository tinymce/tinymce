/**
 * NormalizeRange.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.NormalizeRange',
  [
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker'
  ],
  function (CaretContainer, NodeType, TreeWalker) {
    var isContentEditableFalse = NodeType.isContentEditableFalse,
      isCaretContainer = CaretContainer.isCaretContainer;

    var findParent = function (node, rootNode, predicate) {
      while (node && node !== rootNode) {
        if (predicate(node)) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    };

    var hasParent = function (node, rootNode, predicate) {
      return findParent(node, rootNode, predicate) !== null;
    };

    var hasParentWithName = function (node, rootNode, name) {
      return hasParent(node, rootNode, function (node) {
        return node.nodeName === name;
      });
    };

    var isFormatterCaret = function (node) {
      return node.id === '_mce_caret';
    };

    var isCeFalseCaretContainer = function (node, rootNode) {
      return isCaretContainer(node) && hasParent(node, rootNode, isFormatterCaret) === false;
    };

    var normalize = function (dom, rng) {
      var normalized = false, collapsed;

      var normalizeEndPoint = function (start) {
        var container, offset, walker, body = dom.getRoot(), node, nonEmptyElementsMap;
        var directionLeft, isAfterNode;

        var isTableCell = function (node) {
          return node && /^(TD|TH|CAPTION)$/.test(node.nodeName);
        };

        var hasBrBeforeAfter = function (node, left) {
          var walker = new TreeWalker(node, dom.getParent(node.parentNode, dom.isBlock) || body);

          while ((node = walker[left ? 'prev' : 'next']())) {
            if (node.nodeName === "BR") {
              return true;
            }
          }
        };

        var hasContentEditableFalseParent = function (node) {
          while (node && node != body) {
            if (isContentEditableFalse(node)) {
              return true;
            }

            node = node.parentNode;
          }

          return false;
        };

        var isPrevNode = function (node, name) {
          return node.previousSibling && node.previousSibling.nodeName == name;
        };

        // Walks the dom left/right to find a suitable text node to move the endpoint into
        // It will only walk within the current parent block or body and will stop if it hits a block or a BR/IMG
        var findTextNodeRelative = function (left, startNode) {
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
        };

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
      };

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

    return {
      normalize: normalize
    };
  }
);