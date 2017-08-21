/**
 * Empty.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Empty',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorExists',
    'tinymce.core.caret.CaretCandidate',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker'
  ],
  function (Fun, Compare, Element, SelectorExists, CaretCandidate, NodeType, TreeWalker) {
    var hasWhitespacePreserveParent = function (rootNode, node) {
      var rootElement = Element.fromDom(rootNode);
      var startNode = Element.fromDom(node);
      return SelectorExists.ancestor(startNode, 'pre,code', Fun.curry(Compare.eq, rootElement));
    };

    var isWhitespace = function (rootNode, node) {
      return NodeType.isText(node) && /^[ \t\r\n]*$/.test(node.data) && hasWhitespacePreserveParent(rootNode, node) === false;
    };

    var isNamedAnchor = function (node) {
      return NodeType.isElement(node) && node.nodeName === 'A' && node.hasAttribute('name');
    };

    var isContent = function (rootNode, node) {
      return (CaretCandidate.isCaretCandidate(node) && isWhitespace(rootNode, node) === false) || isNamedAnchor(node) || isBookmark(node);
    };

    var isBookmark = NodeType.hasAttribute('data-mce-bookmark');
    var isBogus = NodeType.hasAttribute('data-mce-bogus');
    var isBogusAll = NodeType.hasAttributeValue('data-mce-bogus', 'all');

    var isEmptyNode = function (targetNode) {
      var walker, node, brCount = 0;

      if (isContent(targetNode, targetNode)) {
        return false;
      } else {
        node = targetNode.firstChild;
        if (!node) {
          return true;
        }

        walker = new TreeWalker(node, targetNode);
        do {
          if (isBogusAll(node)) {
            node = walker.next(true);
            continue;
          }

          if (isBogus(node)) {
            node = walker.next();
            continue;
          }

          if (NodeType.isBr(node)) {
            brCount++;
            node = walker.next();
            continue;
          }

          if (isContent(targetNode, node)) {
            return false;
          }

          node = walker.next();
        } while (node);

        return brCount <= 1;
      }
    };

    var isEmpty = function (elm) {
      return isEmptyNode(elm.dom());
    };

    return {
      isEmpty: isEmpty
    };
  }
);
