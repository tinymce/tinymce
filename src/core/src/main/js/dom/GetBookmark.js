/**
 * GetBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.GetBookmark',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.caret.CaretBookmark',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.selection.RangeNodes',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (Fun, CaretBookmark, CaretContainer, CaretPosition, NodeType, RangeNodes, Zwsp, Tools) {
    var isContentEditableFalse = NodeType.isContentEditableFalse;

    var getNormalizedTextOffset = function (trim, container, offset) {
      var node, trimmedOffset;

      trimmedOffset = trim(container.data.slice(0, offset)).length;
      for (node = container.previousSibling; node && NodeType.isText(node); node = node.previousSibling) {
        trimmedOffset += trim(node.data).length;
      }

      return trimmedOffset;
    };

    var getPoint = function (dom, trim, normalized, rng, start) {
      var container = rng[start ? 'startContainer' : 'endContainer'];
      var offset = rng[start ? 'startOffset' : 'endOffset'], point = [], childNodes, after = 0;
      var root = dom.getRoot();

      if (NodeType.isText(container)) {
        point.push(normalized ? getNormalizedTextOffset(trim, container, offset) : offset);
      } else {
        childNodes = container.childNodes;

        if (offset >= childNodes.length && childNodes.length) {
          after = 1;
          offset = Math.max(0, childNodes.length - 1);
        }

        point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
      }

      for (; container && container !== root; container = container.parentNode) {
        point.push(dom.nodeIndex(container, normalized));
      }

      return point;
    };

    var getLocation = function (trim, selection, normalized, rng) {
      var dom = selection.dom, bookmark = {};

      bookmark.start = getPoint(dom, trim, normalized, rng, true);

      if (!selection.isCollapsed()) {
        bookmark.end = getPoint(dom, trim, normalized, rng, false);
      }

      return bookmark;
    };

    var trimEmptyTextNode = function (node) {
      if (NodeType.isText(node) && node.data.length === 0) {
        node.parentNode.removeChild(node);
      }
    };

    var findIndex = function (dom, name, element) {
      var count = 0;

      Tools.each(dom.select(name), function (node) {
        if (node.getAttribute('data-mce-bogus') === 'all') {
          return;
        }

        if (node === element) {
          return false;
        }

        count++;
      });

      return count;
    };

    var moveEndPoint = function (rng, start) {
      var container, offset, childNodes, prefix = start ? 'start' : 'end';

      container = rng[prefix + 'Container'];
      offset = rng[prefix + 'Offset'];

      if (NodeType.isElement(container) && container.nodeName === 'TR') {
        childNodes = container.childNodes;
        container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
        if (container) {
          offset = start ? 0 : container.childNodes.length;
          rng['set' + (start ? 'Start' : 'End')](container, offset);
        }
      }
    };

    var normalizeTableCellSelection = function (rng) {
      moveEndPoint(rng, true);
      moveEndPoint(rng, false);

      return rng;
    };

    var findSibling = function (node, offset) {
      var sibling;

      if (NodeType.isElement(node)) {
        node = RangeNodes.getNode(node, offset);
        if (isContentEditableFalse(node)) {
          return node;
        }
      }

      if (CaretContainer.isCaretContainer(node)) {
        if (NodeType.isText(node) && CaretContainer.isCaretContainerBlock(node)) {
          node = node.parentNode;
        }

        sibling = node.previousSibling;
        if (isContentEditableFalse(sibling)) {
          return sibling;
        }

        sibling = node.nextSibling;
        if (isContentEditableFalse(sibling)) {
          return sibling;
        }
      }
    };

    var findAdjacentContentEditableFalseElm = function (rng) {
      return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
    };

    var getOffsetBookmark = function (trim, normalized, selection) {
      var element = selection.getNode();
      var name = element ? element.nodeName : null;
      var rng = selection.getRng();

      if (isContentEditableFalse(element) || name === 'IMG') {
        return { name: name, index: findIndex(selection.dom, name, element) };
      }

      element = findAdjacentContentEditableFalseElm(rng);
      if (element) {
        name = element.tagName;
        return { name: name, index: findIndex(selection.dom, name, element) };
      }

      return getLocation(trim, selection, normalized, rng);
    };

    var getCaretBookmark = function (selection) {
      var rng = selection.getRng();

      return {
        start: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeStart(rng)),
        end: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeEnd(rng))
      };
    };

    var getRangeBookmark = function (selection) {
      return { rng: selection.getRng() };
    };

    var getPersistentBookmark = function (selection) {
      var dom = selection.dom;
      var rng = selection.getRng();
      var id = dom.uniqueId();
      var collapsed = selection.isCollapsed();
      var styles = 'overflow:hidden;line-height:0px';
      var element = selection.getNode();
      var name = element.nodeName;
      var chr = '&#xFEFF;';

      if (name === 'IMG') {
        return { name: name, index: findIndex(dom, name, element) };
      }

      // W3C method
      var rng2 = normalizeTableCellSelection(rng.cloneRange());

      // Insert end marker
      if (!collapsed) {
        rng2.collapse(false);
        var endBookmarkNode = dom.create('span', { 'data-mce-type': 'bookmark', id: id + '_end', style: styles }, chr);
        rng2.insertNode(endBookmarkNode);
        trimEmptyTextNode(endBookmarkNode.nextSibling);
      }

      rng = normalizeTableCellSelection(rng);
      rng.collapse(true);
      var startBookmarkNode = dom.create('span', { 'data-mce-type': 'bookmark', id: id + '_start', style: styles }, chr);
      rng.insertNode(startBookmarkNode);
      trimEmptyTextNode(startBookmarkNode.previousSibling);

      selection.moveToBookmark({ id: id, keep: 1 });

      return { id: id };
    };

    var getBookmark = function (selection, type, normalized) {
      if (type === 2) {
        return getOffsetBookmark(Zwsp.trim, normalized, selection);
      } else if (type === 3) {
        return getCaretBookmark(selection);
      } else if (type) {
        return getRangeBookmark(selection);
      } else {
        return getPersistentBookmark(selection);
      }
    };

    return {
      getBookmark: getBookmark,
      getUndoBookmark: Fun.curry(getOffsetBookmark, Fun.identity, true)
    };
  }
);