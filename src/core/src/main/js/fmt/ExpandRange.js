/**
 * ExpandRange.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.ExpandRange',
  [
    'tinymce.core.dom.BookmarkManager',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.fmt.FormatUtils'
  ],
  function (BookmarkManager, TreeWalker, FormatUtils) {
    var isBookmarkNode = BookmarkManager.isBookmarkNode;
    var getParents = FormatUtils.getParents, isWhiteSpaceNode = FormatUtils.isWhiteSpaceNode, isTextBlock = FormatUtils.isTextBlock;

    // This function walks down the tree to find the leaf at the selection.
      // The offset is also returned as if node initially a leaf, the offset may be in the middle of the text node.
    var findLeaf = function (node, offset) {
      if (typeof offset === 'undefined') {
        offset = node.nodeType === 3 ? node.length : node.childNodes.length;
      }

      while (node && node.hasChildNodes()) {
        node = node.childNodes[offset];
        if (node) {
          offset = node.nodeType === 3 ? node.length : node.childNodes.length;
        }
      }
      return { node: node, offset: offset };
    };

    var excludeTrailingWhitespace = function (endContainer, endOffset) {
      // Avoid applying formatting to a trailing space,
      // but remove formatting from trailing space
      var leaf = findLeaf(endContainer, endOffset);
      if (leaf.node) {
        while (leaf.node && leaf.offset === 0 && leaf.node.previousSibling) {
          leaf = findLeaf(leaf.node.previousSibling);
        }

        if (leaf.node && leaf.offset > 0 && leaf.node.nodeType === 3 &&
            leaf.node.nodeValue.charAt(leaf.offset - 1) === ' ') {

          if (leaf.offset > 1) {
            endContainer = leaf.node;
            endContainer.splitText(leaf.offset - 1);
          }
        }
      }

      return endContainer;
    };

    var isBogusBr = function (node) {
      return node.nodeName === "BR" && node.getAttribute('data-mce-bogus') && !node.nextSibling;
    };

    var expandRng = function (editor, rng, format, remove) {
      var lastIdx, endPoint,
        startContainer = rng.startContainer,
        startOffset = rng.startOffset,
        endContainer = rng.endContainer,
        endOffset = rng.endOffset,
        dom = editor.dom;

      // This function walks up the tree if there is no siblings before/after the node
      var findParentContainer = function (start) {
        var container, parent, sibling, siblingName, root;

        container = parent = start ? startContainer : endContainer;
        siblingName = start ? 'previousSibling' : 'nextSibling';
        root = dom.getRoot();

        // If it's a text node and the offset is inside the text
        if (container.nodeType === 3 && !isWhiteSpaceNode(container)) {
          if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
            return container;
          }
        }

        /*eslint no-constant-condition:0 */
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

      // If index based start position then resolve it
      if (startContainer.nodeType === 1 && startContainer.hasChildNodes()) {
        lastIdx = startContainer.childNodes.length - 1;
        startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

        if (startContainer.nodeType === 3) {
          startOffset = 0;
        }
      }

      // If index based end position then resolve it
      if (endContainer.nodeType === 1 && endContainer.hasChildNodes()) {
        lastIdx = endContainer.childNodes.length - 1;
        endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

        if (endContainer.nodeType === 3) {
          endOffset = endContainer.nodeValue.length;
        }
      }

      // Expands the node to the closes contentEditable false element if it exists
      var findParentContentEditable = function (node) {
        var parent = node;

        while (parent) {
          if (parent.nodeType === 1 && dom.getContentEditable(parent)) {
            return dom.getContentEditable(parent) === "false" ? parent : node;
          }

          parent = parent.parentNode;
        }

        return node;
      };

      var findWordEndPoint = function (container, offset, start) {
        var walker, node, pos, lastTextNode;

        var findSpace = function (node, offset) {
          var pos, pos2, str = node.nodeValue;

          if (typeof offset === "undefined") {
            offset = start ? str.length : 0;
          }

          if (start) {
            pos = str.lastIndexOf(' ', offset);
            pos2 = str.lastIndexOf('\u00a0', offset);
            pos = pos > pos2 ? pos : pos2;

            // Include the space on remove to avoid tag soup
            if (pos !== -1 && !remove) {
              pos++;
            }
          } else {
            pos = str.indexOf(' ', offset);
            pos2 = str.indexOf('\u00a0', offset);
            pos = pos !== -1 && (pos2 === -1 || pos < pos2) ? pos : pos2;
          }

          return pos;
        };

        if (container.nodeType === 3) {
          pos = findSpace(container, offset);

          if (pos !== -1) {
            return { container: container, offset: pos };
          }

          lastTextNode = container;
        }

        // Walk the nodes inside the block
        walker = new TreeWalker(container, dom.getParent(container, dom.isBlock) || editor.getBody());
        while ((node = walker[start ? 'prev' : 'next']())) {
          if (node.nodeType === 3) {
            lastTextNode = node;
            pos = findSpace(node);

            if (pos !== -1) {
              return { container: node, offset: pos };
            }
          } else if (dom.isBlock(node)) {
            break;
          }
        }

        if (lastTextNode) {
          if (start) {
            offset = 0;
          } else {
            offset = lastTextNode.length;
          }

          return { container: lastTextNode, offset: offset };
        }
      };

      var findSelectorEndPoint = function (container, siblingName) {
        var parents, i, y, curFormat;

        if (container.nodeType === 3 && container.nodeValue.length === 0 && container[siblingName]) {
          container = container[siblingName];
        }

        parents = getParents(dom, container);
        for (i = 0; i < parents.length; i++) {
          for (y = 0; y < format.length; y++) {
            curFormat = format[y];

            // If collapsed state is set then skip formats that doesn't match that
            if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed) {
              continue;
            }

            if (dom.is(parents[i], curFormat.selector)) {
              return parents[i];
            }
          }
        }

        return container;
      };

      var findBlockEndPoint = function (container, siblingName) {
        var node, root = dom.getRoot();

        // Expand to block of similar type
        if (!format[0].wrapper) {
          node = dom.getParent(container, format[0].block, root);
        }

        // Expand to first wrappable block element or any block element
        if (!node) {
          var scopeRoot = dom.getParent(container, 'LI,TD,TH');
          node = dom.getParent(container.nodeType === 3 ? container.parentNode : container, function (node) {
            // Fixes #6183 where it would expand to editable parent element in inline mode
            return node !== root && isTextBlock(editor, node);
          }, scopeRoot);
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

      // Expand to closest contentEditable element
      startContainer = findParentContentEditable(startContainer);
      endContainer = findParentContentEditable(endContainer);

      // Exclude bookmark nodes if possible
      if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
        startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
        startContainer = startContainer.nextSibling || startContainer;

        if (startContainer.nodeType === 3) {
          startOffset = 0;
        }
      }

      if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
        endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
        endContainer = endContainer.previousSibling || endContainer;

        if (endContainer.nodeType === 3) {
          endOffset = endContainer.length;
        }
      }

      if (format[0].inline) {
        if (rng.collapsed) {
          // Expand left to closest word boundary
          endPoint = findWordEndPoint(startContainer, startOffset, true);
          if (endPoint) {
            startContainer = endPoint.container;
            startOffset = endPoint.offset;
          }

          // Expand right to closest word boundary
          endPoint = findWordEndPoint(endContainer, endOffset);
          if (endPoint) {
            endContainer = endPoint.container;
            endOffset = endPoint.offset;
          }
        }

        endContainer = remove ? endContainer : excludeTrailingWhitespace(endContainer, endOffset);
      }

      // Move start/end point up the tree if the leaves are sharp and if we are in different containers
      // Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
      // This will reduce the number of wrapper elements that needs to be created
      // Move start point up the tree
      if (format[0].inline || format[0].block_expand) {
        if (!format[0].inline || (startContainer.nodeType !== 3 || startOffset === 0)) {
          startContainer = findParentContainer(true);
        }

        if (!format[0].inline || (endContainer.nodeType !== 3 || endOffset === endContainer.nodeValue.length)) {
          endContainer = findParentContainer();
        }
      }

      // Expand start/end container to matching selector
      if (format[0].selector && format[0].expand !== false && !format[0].inline) {
        // Find new startContainer/endContainer if there is better one
        startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
        endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
      }

      // Expand start/end container to matching block element or text node
      if (format[0].block || format[0].selector) {
        // Find new startContainer/endContainer if there is better one
        startContainer = findBlockEndPoint(startContainer, 'previousSibling');
        endContainer = findBlockEndPoint(endContainer, 'nextSibling');

        // Non block element then try to expand up the leaf
        if (format[0].block) {
          if (!dom.isBlock(startContainer)) {
            startContainer = findParentContainer(true);
          }

          if (!dom.isBlock(endContainer)) {
            endContainer = findParentContainer();
          }
        }
      }

      // Setup index for startContainer
      if (startContainer.nodeType === 1) {
        startOffset = dom.nodeIndex(startContainer);
        startContainer = startContainer.parentNode;
      }

      // Setup index for endContainer
      if (endContainer.nodeType === 1) {
        endOffset = dom.nodeIndex(endContainer) + 1;
        endContainer = endContainer.parentNode;
      }

      // Return new range like object
      return {
        startContainer: startContainer,
        startOffset: startOffset,
        endContainer: endContainer,
        endOffset: endOffset
      };
    };

    return {
      expandRng: expandRng
    };
  }
);