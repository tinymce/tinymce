/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Compare, Element, SelectorExists } from '@ephox/sugar';
import * as CaretCandidate from '../caret/CaretCandidate';
import NodeType from './NodeType';
import TreeWalker from '../api/dom/TreeWalker';

const hasWhitespacePreserveParent = function (rootNode, node) {
  const rootElement = Element.fromDom(rootNode);
  const startNode = Element.fromDom(node);
  return SelectorExists.ancestor(startNode, 'pre,code', Fun.curry(Compare.eq, rootElement));
};

const isWhitespace = function (rootNode, node) {
  return NodeType.isText(node) && /^[ \t\r\n]*$/.test(node.data) && hasWhitespacePreserveParent(rootNode, node) === false;
};

const isNamedAnchor = function (node) {
  return NodeType.isElement(node) && node.nodeName === 'A' && node.hasAttribute('name');
};

const isContent = function (rootNode, node) {
  return (CaretCandidate.isCaretCandidate(node) && isWhitespace(rootNode, node) === false) || isNamedAnchor(node) || isBookmark(node);
};

const isBookmark = NodeType.hasAttribute('data-mce-bookmark');
const isBogus = NodeType.hasAttribute('data-mce-bogus');
const isBogusAll = NodeType.hasAttributeValue('data-mce-bogus', 'all');

const isEmptyNode = function (targetNode) {
  let walker, node, brCount = 0;

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

const isEmpty = (elm) => isEmptyNode(elm.dom());

export default {
  isEmpty
};