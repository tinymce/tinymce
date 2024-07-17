import { Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import { SimRange } from '../../api/selection/SimRange';

interface CaretPosition {
  readonly offsetNode: Node | null;
  readonly offset: number;
}

interface VendorDocument {
  readonly caretPositionFromPoint?: (x: number, y: number) => CaretPosition | null;
  readonly caretRangeFromPoint?: (x: number, y: number) => Range | null;
}

const caretPositionFromPoint = (doc: Document & VendorDocument, x: number, y: number): Optional<Range> =>
  Optional.from(doc.caretPositionFromPoint?.(x, y))
    .bind((pos) => {
      // It turns out that Firefox can return null for pos.offsetNode
      if (pos.offsetNode === null) {
        return Optional.none<Range>();
      }
      const r = doc.createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return Optional.some(r);
    });

const caretRangeFromPoint = (doc: VendorDocument, x: number, y: number): Optional<Range> =>
  Optional.from(doc.caretRangeFromPoint?.(x, y));

const availableSearch = (doc: VendorDocument, x: number, y: number): Optional<Range> => {
  if (doc.caretPositionFromPoint) {
    return caretPositionFromPoint(doc as Document, x, y);  // defined standard, firefox only
  } else if (doc.caretRangeFromPoint) {
    return caretRangeFromPoint(doc, x, y); // webkit/blink implementation
  } else {
    return Optional.none(); // unsupported browser
  }
};

const fromPoint = (win: Window, x: number, y: number): Optional<SimRange> => {
  const doc = win.document;
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
