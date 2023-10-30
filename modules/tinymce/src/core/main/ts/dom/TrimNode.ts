import { Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import DomTreeWalker from '../api/dom/TreeWalker';
import Schema from '../api/html/Schema';
import { isContent } from './Empty';
import * as NodeType from './NodeType';

const isSpan = (node: Node): node is HTMLSpanElement =>
  node.nodeName.toLowerCase() === 'span';

const isInlineContent = (node: Node | null, root: Node, schema: Schema): boolean =>
  Type.isNonNullable(node) && (isContent(node, root) || schema.isInline(node.nodeName.toLowerCase()));

const surroundedByInlineContent = (node: Node, root: Node, schema: Schema): boolean => {
  const prev = new DomTreeWalker(node, root).prev(false);
  const next = new DomTreeWalker(node, root).next(false);
  // Check if the next/previous is either inline content or the start/end (eg is undefined)
  const prevIsInline = Type.isUndefined(prev) || isInlineContent(prev, root, schema);
  const nextIsInline = Type.isUndefined(next) || isInlineContent(next, root, schema);
  return prevIsInline && nextIsInline;
};

const isBookmarkNode = (node: Node): boolean =>
  isSpan(node) && node.getAttribute('data-mce-type') === 'bookmark';

// Keep text nodes with only spaces if surrounded by spans.
// eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
const isKeepTextNode = (node: Node, root: Node, schema: Schema): boolean =>
  NodeType.isText(node) && node.data.length > 0 && surroundedByInlineContent(node, root, schema);

// Keep elements as long as they have any children
const isKeepElement = (node: Node): boolean =>
  NodeType.isElement(node) ? node.childNodes.length > 0 : false;

const isDocument = (node: Node): boolean =>
  NodeType.isDocumentFragment(node) || NodeType.isDocument(node);

// W3C valid browsers tend to leave empty nodes to the left/right side of the contents - this makes sense
// but we don't want that in our code since it serves no purpose for the end user
// For example splitting this html at the bold element:
//   <p>text 1<span><b>CHOP</b></span>text 2</p>
// would produce:
//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
// this function will then trim off empty edges and produce:
//   <p>text 1</p><b>CHOP</b><p>text 2</p>
const trimNode = <T extends Node>(dom: DOMUtils, node: T, schema: Schema, root?: Node): T => {
  const rootNode = root || node;
  if (NodeType.isElement(node) && isBookmarkNode(node)) {
    return node;
  }

  const children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    trimNode(dom, children[i], schema, rootNode);
  }

  // If the only child is a bookmark then move it up
  if (NodeType.isElement(node)) {
    const currentChildren = node.childNodes;
    if (currentChildren.length === 1 && isBookmarkNode(currentChildren[0])) {
      node.parentNode?.insertBefore(currentChildren[0], node);
    }
  }

  // Remove any empty nodes
  if (!isDocument(node) && !isContent(node, rootNode) && !isKeepElement(node) && !isKeepTextNode(node, rootNode, schema)) {
    dom.remove(node);
  }

  return node;
};

export {
  trimNode
};
