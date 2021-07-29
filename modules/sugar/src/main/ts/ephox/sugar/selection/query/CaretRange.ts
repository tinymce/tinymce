import { Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as Traverse from '../../api/search/Traverse';
import { SimRange } from '../../api/selection/SimRange';
import * as ContainerPoint from './ContainerPoint';
import * as EdgePoint from './EdgePoint';

interface CaretPosition {
  readonly offsetNode: Node | null;
  readonly offset: number;
}

interface VendorDocument {
  readonly caretPositionFromPoint?: (x: number, y: number) => CaretPosition | null;
  readonly caretRangeFromPoint?: (x: number, y: number) => Range | null;
}

declare const document: VendorDocument;

const caretPositionFromPoint = (doc: SugarElement<Document>, x: number, y: number): Optional<Range> =>
  Optional.from((doc.dom as VendorDocument).caretPositionFromPoint?.(x, y))
    .bind((pos) => {
      // It turns out that Firefox can return null for pos.offsetNode
      if (pos.offsetNode === null) {
        return Optional.none<Range>();
      }
      const r = doc.dom.createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return Optional.some(r);
    });

const caretRangeFromPoint = (doc: SugarElement<Document>, x: number, y: number): Optional<Range> =>
  Optional.from((doc.dom as VendorDocument).caretRangeFromPoint?.(x, y));

const searchTextNodes = (doc: SugarElement<Document>, node: SugarElement<Node>, x: number, y: number): Optional<Range> => {
  const r = doc.dom.createRange();
  r.selectNode(node.dom);
  const rect = r.getBoundingClientRect();
  // Clamp x,y at the bounds of the node so that the locate function has SOME chance
  const boundedX = Math.max(rect.left, Math.min(rect.right, x));
  const boundedY = Math.max(rect.top, Math.min(rect.bottom, y));

  return ContainerPoint.locate(doc, node, boundedX, boundedY);
};

const searchFromPoint = (doc: SugarElement<Document>, x: number, y: number): Optional<Range> =>
  // elementFromPoint is defined to return null when there is no element at the point
  // This often happens when using IE10 event.y instead of event.clientY
  SugarElement.fromPoint(doc, x, y).bind((elem) => {
    // used when the x,y position points to an image, or outside the bounds
    const fallback = () => EdgePoint.search(doc, elem, x);

    return Traverse.children(elem).length === 0 ? fallback() :
    // if we have children, search for the right text node and then get the offset out of it
      searchTextNodes(doc, elem, x, y).orThunk(fallback);
  });

const availableSearch = (() => {
  if (document.caretPositionFromPoint) {
    return caretPositionFromPoint;  // defined standard
  } else if (document.caretRangeFromPoint) {
    return caretRangeFromPoint; // webkit implementation
  } else {
    return searchFromPoint; // fallback
  }
})();

const fromPoint = (win: Window, x: number, y: number): Optional<SimRange> => {
  const doc = SugarElement.fromDom(win.document);
  return availableSearch(doc, x, y).map((rng) => SimRange.create(
    SugarElement.fromDom(rng.startContainer),
    rng.startOffset,
    SugarElement.fromDom(rng.endContainer),
    rng.endOffset
  ));
};

export {
  fromPoint
};
