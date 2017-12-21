/**
 * Empty.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { SelectorExists } from '@ephox/sugar';
import CaretCandidate from '../caret/CaretCandidate';
import NodeType from './NodeType';
import TreeWalker from './TreeWalker';

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

export default <any> {
  isEmpty: isEmpty
};