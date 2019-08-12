import { Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Traverse from '../../api/search/Traverse';
import { SimRange } from '../../api/selection/SimRange';
import * as ContainerPoint from './ContainerPoint';
import * as EdgePoint from './EdgePoint';
import { Window, Document, Range, Node as DomNode } from '@ephox/dom-globals';

declare const document: any;

const caretPositionFromPoint = function (doc: Element<Document>, x: number, y: number) {
  return Option.from((doc.dom() as any).caretPositionFromPoint(x, y)).bind(function (pos) {
    // It turns out that Firefox can return null for pos.offsetNode
    if (pos.offsetNode === null) {
      return Option.none<Range>();
    }
    const r = doc.dom().createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.collapse();
    return Option.some(r);
  });
};

const caretRangeFromPoint = function (doc: Element<Document>, x: number, y: number) {
  return Option.from(doc.dom().caretRangeFromPoint(x, y));
};

const searchTextNodes = function (doc: Element<Document>, node: Element<DomNode>, x: number, y: number) {
  const r = doc.dom().createRange();
  r.selectNode(node.dom());
  const rect = r.getBoundingClientRect();
  // Clamp x,y at the bounds of the node so that the locate function has SOME chance
  const boundedX = Math.max(rect.left, Math.min(rect.right, x));
  const boundedY = Math.max(rect.top, Math.min(rect.bottom, y));

  return ContainerPoint.locate(doc, node, boundedX, boundedY);
};

const searchFromPoint = function (doc: Element<Document>, x: number, y: number): Option<Range> {
  // elementFromPoint is defined to return null when there is no element at the point
  // This often happens when using IE10 event.y instead of event.clientY
  return Element.fromPoint(doc, x, y).bind(function (elem) {
    // used when the x,y position points to an image, or outside the bounds
    const fallback = function () {
      return EdgePoint.search(doc, elem, x);
    };

    return Traverse.children(elem).length === 0 ? fallback() :
            // if we have children, search for the right text node and then get the offset out of it
            searchTextNodes(doc, elem, x, y).orThunk(fallback);
  });
};

const availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint :  // defined standard
                      document.caretRangeFromPoint ? caretRangeFromPoint :        // webkit implementation
                      searchFromPoint;                                            // fallback

const fromPoint = function (win: Window, x: number, y: number) {
  const doc = Element.fromDom(win.document);
  return availableSearch(doc, x, y).map(function (rng) {
    return SimRange.create(
      Element.fromDom(rng.startContainer),
      rng.startOffset,
      Element.fromDom(rng.endContainer),
      rng.endOffset
    );
  });
};

export {
  fromPoint
};