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
