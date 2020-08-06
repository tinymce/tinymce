/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from './NodeType';
import * as Empty from './Empty';

const isSpan = (node: Node): node is HTMLSpanElement =>
  node && node.nodeName.toLowerCase() === 'span';

const surroundedBySpans = (node: Node) => {
  const previousIsSpan = isSpan(node.previousSibling);
  const nextIsSpan = isSpan(node.nextSibling);
  return previousIsSpan && nextIsSpan;
};

const isBookmarkNode = (node: Node) =>
  isSpan(node) && node.getAttribute('data-mce-type') === 'bookmark';

// Keep text nodes with only spaces if surrounded by spans.
// eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
const isKeepTextNode = (node: Node) =>
  NodeType.isText(node) && (Strings.trim(node.data).length !== 0 || surroundedBySpans(node));

const isDocument = (node: Node) => NodeType.isDocumentFragment(node) || NodeType.isDocument(node);

// W3C valid browsers tend to leave empty nodes to the left/right side of the contents - this makes sense
// but we don't want that in our code since it serves no purpose for the end user
// For example splitting this html at the bold element:
//   <p>text 1<span><b>CHOP</b></span>text 2</p>
// would produce:
//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
// this function will then trim off empty edges and produce:
//   <p>text 1</p><b>CHOP</b><p>text 2</p>
const trimNode = (dom: DOMUtils, node: Node): Node => {
  if (NodeType.isElement(node) && isBookmarkNode(node)) {
    return node;
  }

  const children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    trimNode(dom, children[i]);
  }

  if (!isDocument(node) && !isKeepTextNode(node) && Empty.isEmpty(SugarElement.fromDom(node), false)) {
    if (NodeType.isElement(node)) {
      const currentChildren = node.childNodes;

      // Don't remove if there's a br as a child, eg: <p><br></p>
      if (Arr.exists(currentChildren, NodeType.isBr)) {
        return node;
      }

      // If the only child is a bookmark then move it up
      if (currentChildren.length === 1 && isBookmarkNode(currentChildren[0])) {
        node.parentNode.insertBefore(currentChildren[0], node);
      }
    }

    dom.remove(node);
    return node;
  }

  return node;
};

export {
  trimNode
};
