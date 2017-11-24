/**
 * ResolveBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.ResolveBookmark',
  [
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'tinymce.core.Env',
    'tinymce.core.caret.CaretBookmark',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.util.Tools'
  ],
  function (Option, Options, Env, CaretBookmark, CaretPosition, NodeType, Tools) {
    var addBogus = function (dom, node) {
      // Adds a bogus BR element for empty block elements
      if (dom.isBlock(node) && !node.innerHTML && !Env.ie) {
        node.innerHTML = '<br data-mce-bogus="1" />';
      }

      return node;
    };

    var resolveCaretPositionBookmark = function (dom, bookmark) {
      var rng, pos;

      rng = dom.createRng();
      pos = CaretBookmark.resolve(dom.getRoot(), bookmark.start);
      rng.setStart(pos.container(), pos.offset());

      pos = CaretBookmark.resolve(dom.getRoot(), bookmark.end);
      rng.setEnd(pos.container(), pos.offset());

      return rng;
    };

    var setEndPoint = function (dom, start, bookmark, rng) {
      var point = bookmark[start ? 'start' : 'end'], i, node, offset, children, root = dom.getRoot();

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
    };

    var restoreEndPoint = function (dom, suffix, bookmark) {
      var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;
      var container, offset;

      if (marker) {
        node = marker.parentNode;

        if (suffix === 'start') {
          if (!keep) {
            idx = dom.nodeIndex(marker);
          } else {
            node = marker.firstChild;
            idx = 1;
          }

          container = node;
          offset = idx;
        } else {
          if (!keep) {
            idx = dom.nodeIndex(marker);
          } else {
            node = marker.firstChild;
            idx = 1;
          }

          container = node;
          offset = idx;
        }

        if (!keep) {
          prev = marker.previousSibling;
          next = marker.nextSibling;

          // Remove all marker text nodes
          Tools.each(Tools.grep(marker.childNodes), function (node) {
            if (NodeType.isText(node)) {
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
          if (prev && next && prev.nodeType === next.nodeType && NodeType.isText(prev) && !Env.opera) {
            idx = prev.nodeValue.length;
            prev.appendData(next.nodeValue);
            dom.remove(next);

            if (suffix === 'start') {
              container = prev;
              offset = idx;
            } else {
              container = prev;
              offset = idx;
            }
          }
        }

        return Option.some(CaretPosition(container, offset));
      } else {
        return Option.none();
      }
    };

    var alt = function (o1, o2) {
      return o1.isSome() ? o1 : o2;
    };

    var resolvePaths = function (dom, bookmark) {
      var rng = dom.createRng();

      if (setEndPoint(dom, true, bookmark, rng) && setEndPoint(dom, false, bookmark, rng)) {
        return Option.some(rng);
      } else {
        return Option.none();
      }
    };

    var resolveId = function (dom, bookmark) {
      var startPos = restoreEndPoint(dom, 'start', bookmark);
      var endPos = restoreEndPoint(dom, 'end', bookmark);

      return Options.liftN([
        startPos,
        alt(endPos, startPos)
      ], function (spos, epos) {
        var rng = dom.createRng();
        rng.setStart(addBogus(dom, spos.container()), spos.offset());
        rng.setEnd(addBogus(dom, epos.container()), epos.offset());
        return rng;
      });
    };

    var resolveIndex = function (dom, bookmark) {
      return Option.from(dom.select(bookmark.name)[bookmark.index]).map(function (elm) {
        var rng = dom.createRng();
        rng.selectNode(elm);
        return rng;
      });
    };

    var resolve = function (selection, bookmark) {
      var dom = selection.dom;

      if (bookmark) {
        if (Tools.isArray(bookmark.start)) {
          return resolvePaths(dom, bookmark);
        } else if (typeof bookmark.start === 'string') {
          return Option.some(resolveCaretPositionBookmark(dom, bookmark));
        } else if (bookmark.id) {
          return resolveId(dom, bookmark);
        } else if (bookmark.name) {
          return resolveIndex(dom, bookmark);
        } else if (bookmark.rng) {
          return Option.some(bookmark.rng);
        }
      }

      return Option.none();
    };

    return {
      resolve: resolve
    };
  }
);