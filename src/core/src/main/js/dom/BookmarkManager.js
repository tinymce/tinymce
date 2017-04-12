/**
 * BookmarkManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles selection bookmarks.
 *
 * @class tinymce.dom.BookmarkManager
 */
define(
  'tinymce.core.dom.BookmarkManager',
  [
    'tinymce.core.caret.CaretBookmark',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.Env',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (CaretBookmark, CaretContainer, CaretPosition, NodeType, RangeUtils, Env, Zwsp, Tools) {
    var isContentEditableFalse = NodeType.isContentEditableFalse;

    var getNormalizedTextOffset = function (container, offset) {
      var node, trimmedOffset;

      trimmedOffset = Zwsp.trim(container.data.slice(0, offset)).length;
      for (node = container.previousSibling; node && node.nodeType === 3; node = node.previousSibling) {
        trimmedOffset += Zwsp.trim(node.data).length;
      }

      return trimmedOffset;
    };

    /**
     * Constructs a new BookmarkManager instance for a specific selection instance.
     *
     * @constructor
     * @method BookmarkManager
     * @param {tinymce.dom.Selection} selection Selection instance to handle bookmarks for.
     */
    function BookmarkManager(selection) {
      var dom = selection.dom;

      /**
       * Returns a bookmark location for the current selection. This bookmark object
       * can then be used to restore the selection after some content modification to the document.
       *
       * @method getBookmark
       * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
       * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
       * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
       * @example
       * // Stores a bookmark of the current selection
       * var bm = tinymce.activeEditor.selection.getBookmark();
       *
       * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
       *
       * // Restore the selection bookmark
       * tinymce.activeEditor.selection.moveToBookmark(bm);
       */
      this.getBookmark = function (type, normalized) {
        var rng, rng2, id, collapsed, name, element, chr = '&#xFEFF;', styles;

        function findIndex(name, element) {
          var count = 0;

          Tools.each(dom.select(name), function (node) {
            if (node.getAttribute('data-mce-bogus') === 'all') {
              return;
            }

            if (node == element) {
              return false;
            }

            count++;
          });

          return count;
        }

        function normalizeTableCellSelection(rng) {
          function moveEndPoint(start) {
            var container, offset, childNodes, prefix = start ? 'start' : 'end';

            container = rng[prefix + 'Container'];
            offset = rng[prefix + 'Offset'];

            if (container.nodeType == 1 && container.nodeName == "TR") {
              childNodes = container.childNodes;
              container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
              if (container) {
                offset = start ? 0 : container.childNodes.length;
                rng['set' + (start ? 'Start' : 'End')](container, offset);
              }
            }
          }

          moveEndPoint(true);
          moveEndPoint();

          return rng;
        }

        function getLocation(rng) {
          var root = dom.getRoot(), bookmark = {};

          function getPoint(rng, start) {
            var container = rng[start ? 'startContainer' : 'endContainer'],
              offset = rng[start ? 'startOffset' : 'endOffset'], point = [], childNodes, after = 0;

            if (container.nodeType === 3) {
              point.push(normalized ? getNormalizedTextOffset(container, offset) : offset);
            } else {
              childNodes = container.childNodes;

              if (offset >= childNodes.length && childNodes.length) {
                after = 1;
                offset = Math.max(0, childNodes.length - 1);
              }

              point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
            }

            for (; container && container != root; container = container.parentNode) {
              point.push(dom.nodeIndex(container, normalized));
            }

            return point;
          }

          bookmark.start = getPoint(rng, true);

          if (!selection.isCollapsed()) {
            bookmark.end = getPoint(rng);
          }

          return bookmark;
        }

        function findAdjacentContentEditableFalseElm(rng) {
          function findSibling(node, offset) {
            var sibling;

            if (NodeType.isElement(node)) {
              node = RangeUtils.getNode(node, offset);
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
          }

          return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
        }

        if (type == 2) {
          element = selection.getNode();
          name = element ? element.nodeName : null;
          rng = selection.getRng();

          if (isContentEditableFalse(element) || name == 'IMG') {
            return { name: name, index: findIndex(name, element) };
          }

          if (selection.tridentSel) {
            return selection.tridentSel.getBookmark(type);
          }

          element = findAdjacentContentEditableFalseElm(rng);
          if (element) {
            name = element.tagName;
            return { name: name, index: findIndex(name, element) };
          }

          return getLocation(rng);
        }

        if (type == 3) {
          rng = selection.getRng();

          return {
            start: CaretBookmark.create(dom.getRoot(), CaretPosition.fromRangeStart(rng)),
            end: CaretBookmark.create(dom.getRoot(), CaretPosition.fromRangeEnd(rng))
          };
        }

        // Handle simple range
        if (type) {
          return { rng: selection.getRng() };
        }

        rng = selection.getRng();
        id = dom.uniqueId();
        collapsed = selection.isCollapsed();
        styles = 'overflow:hidden;line-height:0px';

        // Explorer method
        if (rng.duplicate || rng.item) {
          // Text selection
          if (!rng.item) {
            rng2 = rng.duplicate();

            try {
              // Insert start marker
              rng.collapse();
              rng.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

              // Insert end marker
              if (!collapsed) {
                rng2.collapse(false);

                // Detect the empty space after block elements in IE and move the
                // end back one character <p></p>] becomes <p>]</p>
                rng.moveToElementText(rng2.parentElement());
                if (rng.compareEndPoints('StartToEnd', rng2) === 0) {
                  rng2.move('character', -1);
                }

                rng2.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
              }
            } catch (ex) {
              // IE might throw unspecified error so lets ignore it
              return null;
            }
          } else {
            // Control selection
            element = rng.item(0);
            name = element.nodeName;

            return { name: name, index: findIndex(name, element) };
          }
        } else {
          element = selection.getNode();
          name = element.nodeName;
          if (name == 'IMG') {
            return { name: name, index: findIndex(name, element) };
          }

          // W3C method
          rng2 = normalizeTableCellSelection(rng.cloneRange());

          // Insert end marker
          if (!collapsed) {
            rng2.collapse(false);
            rng2.insertNode(dom.create('span', { 'data-mce-type': "bookmark", id: id + '_end', style: styles }, chr));
          }

          rng = normalizeTableCellSelection(rng);
          rng.collapse(true);
          rng.insertNode(dom.create('span', { 'data-mce-type': "bookmark", id: id + '_start', style: styles }, chr));
        }

        selection.moveToBookmark({ id: id, keep: 1 });

        return { id: id };
      };

      /**
       * Restores the selection to the specified bookmark.
       *
       * @method moveToBookmark
       * @param {Object} bookmark Bookmark to restore selection from.
       * @return {Boolean} true/false if it was successful or not.
       * @example
       * // Stores a bookmark of the current selection
       * var bm = tinymce.activeEditor.selection.getBookmark();
       *
       * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
       *
       * // Restore the selection bookmark
       * tinymce.activeEditor.selection.moveToBookmark(bm);
       */
      this.moveToBookmark = function (bookmark) {
        var rng, root, startContainer, endContainer, startOffset, endOffset;

        function setEndPoint(start) {
          var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

          if (point) {
            offset = point[0];

            // Find container node
            for (node = root, i = point.length - 1; i >= 1; i--) {
              children = node.childNodes;

              if (point[i] > children.length - 1) {
                return;
              }

              node = children[point[i]];
            }

            // Move text offset to best suitable location
            if (node.nodeType === 3) {
              offset = Math.min(point[0], node.nodeValue.length);
            }

            // Move element offset to best suitable location
            if (node.nodeType === 1) {
              offset = Math.min(point[0], node.childNodes.length);
            }

            // Set offset within container node
            if (start) {
              rng.setStart(node, offset);
            } else {
              rng.setEnd(node, offset);
            }
          }

          return true;
        }

        function restoreEndPoint(suffix) {
          var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

          if (marker) {
            node = marker.parentNode;

            if (suffix == 'start') {
              if (!keep) {
                idx = dom.nodeIndex(marker);
              } else {
                node = marker.firstChild;
                idx = 1;
              }

              startContainer = endContainer = node;
              startOffset = endOffset = idx;
            } else {
              if (!keep) {
                idx = dom.nodeIndex(marker);
              } else {
                node = marker.firstChild;
                idx = 1;
              }

              endContainer = node;
              endOffset = idx;
            }

            if (!keep) {
              prev = marker.previousSibling;
              next = marker.nextSibling;

              // Remove all marker text nodes
              Tools.each(Tools.grep(marker.childNodes), function (node) {
                if (node.nodeType == 3) {
                  node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
                }
              });

              // Remove marker but keep children if for example contents where inserted into the marker
              // Also remove duplicated instances of the marker for example by a
              // split operation or by WebKit auto split on paste feature
              while ((marker = dom.get(bookmark.id + '_' + suffix))) {
                dom.remove(marker, 1);
              }

              // If siblings are text nodes then merge them unless it's Opera since it some how removes the node
              // and we are sniffing since adding a lot of detection code for a browser with 3% of the market
              // isn't worth the effort. Sorry, Opera but it's just a fact
              if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !Env.opera) {
                idx = prev.nodeValue.length;
                prev.appendData(next.nodeValue);
                dom.remove(next);

                if (suffix == 'start') {
                  startContainer = endContainer = prev;
                  startOffset = endOffset = idx;
                } else {
                  endContainer = prev;
                  endOffset = idx;
                }
              }
            }
          }
        }

        function addBogus(node) {
          // Adds a bogus BR element for empty block elements
          if (dom.isBlock(node) && !node.innerHTML && !Env.ie) {
            node.innerHTML = '<br data-mce-bogus="1" />';
          }

          return node;
        }

        function resolveCaretPositionBookmark() {
          var rng, pos;

          rng = dom.createRng();
          pos = CaretBookmark.resolve(dom.getRoot(), bookmark.start);
          rng.setStart(pos.container(), pos.offset());

          pos = CaretBookmark.resolve(dom.getRoot(), bookmark.end);
          rng.setEnd(pos.container(), pos.offset());

          return rng;
        }

        if (bookmark) {
          if (Tools.isArray(bookmark.start)) {
            rng = dom.createRng();
            root = dom.getRoot();

            if (selection.tridentSel) {
              return selection.tridentSel.moveToBookmark(bookmark);
            }

            if (setEndPoint(true) && setEndPoint()) {
              selection.setRng(rng);
            }
          } else if (typeof bookmark.start == 'string') {
            selection.setRng(resolveCaretPositionBookmark(bookmark));
          } else if (bookmark.id) {
            // Restore start/end points
            restoreEndPoint('start');
            restoreEndPoint('end');

            if (startContainer) {
              rng = dom.createRng();
              rng.setStart(addBogus(startContainer), startOffset);
              rng.setEnd(addBogus(endContainer), endOffset);
              selection.setRng(rng);
            }
          } else if (bookmark.name) {
            selection.select(dom.select(bookmark.name)[bookmark.index]);
          } else if (bookmark.rng) {
            selection.setRng(bookmark.rng);
          }
        }
      };
    }

    /**
     * Returns true/false if the specified node is a bookmark node or not.
     *
     * @static
     * @method isBookmarkNode
     * @param {DOMNode} node DOM Node to check if it's a bookmark node or not.
     * @return {Boolean} true/false if the node is a bookmark node or not.
     */
    BookmarkManager.isBookmarkNode = function (node) {
      return node && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
    };

    return BookmarkManager;
  }
);