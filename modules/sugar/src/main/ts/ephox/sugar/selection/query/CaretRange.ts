import { Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as ContentEditable from '../../api/properties/ContentEditable';
import { SimRange } from '../../api/selection/SimRange';

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

const availableSearch = (() => {
  if (document.caretPositionFromPoint) {
    return caretPositionFromPoint;  // defined standard
  } else if (document.caretRangeFromPoint) {
    return caretRangeFromPoint; // webkit implementation
  } else {
    return Optional.none; // unsupported browser
  }
})();

const getNodeIndex = (node: Node): number => Array.prototype.indexOf.call(
  node.parentNode?.children, node);

const fromPoint = (win: Window, x: number, y: number): Optional<SimRange> => {
  const doc = SugarElement.fromDom(win.document);
  return availableSearch(doc, x, y).map((rng) => {
    const startContainer = SugarElement.fromDom(rng.startContainer);
    const endContainer = SugarElement.fromDom(rng.endContainer);

    const isStartEditable = ContentEditable.isEditable(startContainer as SugarElement);
    const isEndEditable = ContentEditable.isEditable(endContainer as SugarElement);

    if (!isStartEditable && rng.startContainer.parentNode && !isEndEditable && rng.endContainer.parentNode) {
      return SimRange.create(
        SugarElement.fromDom(rng.startContainer.parentNode),
        getNodeIndex(rng.startContainer) + 1,
        SugarElement.fromDom(rng.endContainer.parentNode),
        getNodeIndex(rng.endContainer) + 1
      );
    } else {
      return SimRange.create(
        startContainer,
        rng.startOffset,
        endContainer,
        rng.endOffset
      );
    }
  });
};

export {
  fromPoint
};
