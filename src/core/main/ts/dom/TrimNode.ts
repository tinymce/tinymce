import { Element } from '@ephox/sugar';
import * as ElementType from './ElementType';
import NodeType from './NodeType';
import Tools from '../api/util/Tools';

const surroundedBySpans = function (node) {
  const previousIsSpan = node.previousSibling && node.previousSibling.nodeName === 'SPAN';
  const nextIsSpan = node.nextSibling && node.nextSibling.nodeName === 'SPAN';
  return previousIsSpan && nextIsSpan;
};

const isBookmarkNode = function (node) {
  return node && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
};

// W3C valid browsers tend to leave empty nodes to the left/right side of the contents - this makes sense
// but we don't want that in our code since it serves no purpose for the end user
// For example splitting this html at the bold element:
//   <p>text 1<span><b>CHOP</b></span>text 2</p>
// would produce:
//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
// this function will then trim off empty edges and produce:
//   <p>text 1</p><b>CHOP</b><p>text 2</p>
const trimNode = function (dom, node) {
  let i, children = node.childNodes;

  if (NodeType.isElement(node) && isBookmarkNode(node)) {
    return;
  }

  for (i = children.length - 1; i >= 0; i--) {
    trimNode(dom, children[i]);
  }

  if (NodeType.isDocument(node) === false) {
    // Keep non whitespace text nodes
    if (NodeType.isText(node) && node.nodeValue.length > 0) {
      // Keep if parent element is a block or if there is some useful content
      const trimmedLength = Tools.trim(node.nodeValue).length;
      if (dom.isBlock(node.parentNode) || trimmedLength > 0) {
        return;
      }
      // Also keep text nodes with only spaces if surrounded by spans.
      // eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
      if (trimmedLength === 0 && surroundedBySpans(node)) {
        return;
      }
    } else if (NodeType.isElement(node)) {
      // If the only child is a bookmark then move it up
      children = node.childNodes;

      if (children.length === 1 && isBookmarkNode(children[0])) {
        node.parentNode.insertBefore(children[0], node);
      }

      // Keep non empty elements and void elements
      if (children.length || ElementType.isVoid(Element.fromDom(node))) {
        return;
      }
    }

    dom.remove(node);
  }
  return node;
};

export default {
  trimNode
};