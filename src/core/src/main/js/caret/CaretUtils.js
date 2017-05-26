/**
 * CaretUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions shared by the caret logic.
 *
 * @private
 * @class tinymce.caret.CaretUtils
 */
define(
  'tinymce.core.caret.CaretUtils',
  [
    "tinymce.core.util.Fun",
    "tinymce.core.dom.TreeWalker",
    "tinymce.core.dom.NodeType",
    "tinymce.core.caret.CaretPosition",
    "tinymce.core.caret.CaretContainer",
    "tinymce.core.caret.CaretCandidate"
  ],
  function (Fun, TreeWalker, NodeType, CaretPosition, CaretContainer, CaretCandidate) {
    var isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isBlockLike = NodeType.matchStyleValues('display', 'block table table-cell table-caption list-item'),
      isCaretContainer = CaretContainer.isCaretContainer,
      isCaretContainerBlock = CaretContainer.isCaretContainerBlock,
      curry = Fun.curry,
      isElement = NodeType.isElement,
      isCaretCandidate = CaretCandidate.isCaretCandidate;

    function isForwards(direction) {
      return direction > 0;
    }

    function isBackwards(direction) {
      return direction < 0;
    }

    function skipCaretContainers(walk, shallow) {
      var node;

      while ((node = walk(shallow))) {
        if (!isCaretContainerBlock(node)) {
          return node;
        }
      }

      return null;
    }

    function findNode(node, direction, predicateFn, rootNode, shallow) {
      var walker = new TreeWalker(node, rootNode);

      if (isBackwards(direction)) {
        if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
          node = skipCaretContainers(walker.prev, true);
          if (predicateFn(node)) {
            return node;
          }
        }

        while ((node = skipCaretContainers(walker.prev, shallow))) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }

      if (isForwards(direction)) {
        if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
          node = skipCaretContainers(walker.next, true);
          if (predicateFn(node)) {
            return node;
          }
        }

        while ((node = skipCaretContainers(walker.next, shallow))) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }

      return null;
    }

    function getEditingHost(node, rootNode) {
      for (node = node.parentNode; node && node != rootNode; node = node.parentNode) {
        if (isContentEditableTrue(node)) {
          return node;
        }
      }

      return rootNode;
    }

    function getParentBlock(node, rootNode) {
      while (node && node != rootNode) {
        if (isBlockLike(node)) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    }

    function isInSameBlock(caretPosition1, caretPosition2, rootNode) {
      return getParentBlock(caretPosition1.container(), rootNode) == getParentBlock(caretPosition2.container(), rootNode);
    }

    function isInSameEditingHost(caretPosition1, caretPosition2, rootNode) {
      return getEditingHost(caretPosition1.container(), rootNode) == getEditingHost(caretPosition2.container(), rootNode);
    }

    function getChildNodeAtRelativeOffset(relativeOffset, caretPosition) {
      var container, offset;

      if (!caretPosition) {
        return null;
      }

      container = caretPosition.container();
      offset = caretPosition.offset();

      if (!isElement(container)) {
        return null;
      }

      return container.childNodes[offset + relativeOffset];
    }

    function beforeAfter(before, node) {
      var range = node.ownerDocument.createRange();

      if (before) {
        range.setStartBefore(node);
        range.setEndBefore(node);
      } else {
        range.setStartAfter(node);
        range.setEndAfter(node);
      }

      return range;
    }

    function isNodesInSameBlock(rootNode, node1, node2) {
      return getParentBlock(node1, rootNode) == getParentBlock(node2, rootNode);
    }

    function lean(left, rootNode, node) {
      var sibling, siblingName;

      if (left) {
        siblingName = 'previousSibling';
      } else {
        siblingName = 'nextSibling';
      }

      while (node && node != rootNode) {
        sibling = node[siblingName];

        if (isCaretContainer(sibling)) {
          sibling = sibling[siblingName];
        }

        if (isContentEditableFalse(sibling)) {
          if (isNodesInSameBlock(rootNode, sibling, node)) {
            return sibling;
          }

          break;
        }

        if (isCaretCandidate(sibling)) {
          break;
        }

        node = node.parentNode;
      }

      return null;
    }

    var before = curry(beforeAfter, true);
    var after = curry(beforeAfter, false);

    function normalizeRange(direction, rootNode, range) {
      var node, container, offset, location;
      var leanLeft = curry(lean, true, rootNode);
      var leanRight = curry(lean, false, rootNode);

      container = range.startContainer;
      offset = range.startOffset;

      if (CaretContainer.isCaretContainerBlock(container)) {
        if (!isElement(container)) {
          container = container.parentNode;
        }

        location = container.getAttribute('data-mce-caret');

        if (location == 'before') {
          node = container.nextSibling;
          if (isContentEditableFalse(node)) {
            return before(node);
          }
        }

        if (location == 'after') {
          node = container.previousSibling;
          if (isContentEditableFalse(node)) {
            return after(node);
          }
        }
      }

      if (!range.collapsed) {
        return range;
      }

      if (NodeType.isText(container)) {
        if (isCaretContainer(container)) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before(node);
            }

            node = leanLeft(container);
            if (node) {
              return after(node);
            }
          }

          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after(node);
            }

            node = leanRight(container);
            if (node) {
              return before(node);
            }
          }

          return range;
        }

        if (CaretContainer.endsWithCaretContainer(container) && offset >= container.data.length - 1) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before(node);
            }
          }

          return range;
        }

        if (CaretContainer.startsWithCaretContainer(container) && offset <= 1) {
          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after(node);
            }
          }

          return range;
        }

        if (offset === container.data.length) {
          node = leanRight(container);
          if (node) {
            return before(node);
          }

          return range;
        }

        if (offset === 0) {
          node = leanLeft(container);
          if (node) {
            return after(node);
          }

          return range;
        }
      }

      return range;
    }

    function isNextToContentEditableFalse(relativeOffset, caretPosition) {
      return isContentEditableFalse(getChildNodeAtRelativeOffset(relativeOffset, caretPosition));
    }

    return {
      isForwards: isForwards,
      isBackwards: isBackwards,
      findNode: findNode,
      getEditingHost: getEditingHost,
      getParentBlock: getParentBlock,
      isInSameBlock: isInSameBlock,
      isInSameEditingHost: isInSameEditingHost,
      isBeforeContentEditableFalse: curry(isNextToContentEditableFalse, 0),
      isAfterContentEditableFalse: curry(isNextToContentEditableFalse, -1),
      normalizeRange: normalizeRange
    };
  }
);
