import { Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as ContentEditable from '../../api/properties/ContentEditable';
import * as PredicateFind from '../../api/search/PredicateFind';
import * as Traverse from '../../api/search/Traverse';
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

const isParentEditable = (node: SugarElement) => Traverse.parent(node).exists((e) => ContentEditable.isEditable(e as SugarElement));

const getNodeIndex = (node: Optional<SugarElement<Node>>): number =>
  node.bind(Traverse.findIndex).map((i) => i < 0 ? 0 : i).getOr(0);

const fromPoint = (win: Window, x: number, y: number): Optional<SimRange> => {
  const doc = SugarElement.fromDom(win.document);
  return availableSearch(doc, x, y).map((rng) => {
    const startContainer = SugarElement.fromDom(rng.startContainer);
    const endContainer = SugarElement.fromDom(rng.endContainer);

    const isStartEditable = ContentEditable.isEditable(startContainer as SugarElement);
    const isEndEditable = ContentEditable.isEditable(endContainer as SugarElement);

    const getLastNonEditableParent = (node: SugarElement<Node>) => isParentEditable(node)
      ? Optional.some(node)
      : PredicateFind.ancestor(node, isParentEditable);

    if (!isStartEditable && !isEndEditable ) {
      const startContainerElement = getLastNonEditableParent(startContainer);
      const endContainerElement = getLastNonEditableParent(endContainer);

      if (startContainerElement.bind(Traverse.parent).isSome() && endContainerElement.bind(Traverse.parent).isSome()) {
        return SimRange.create(
          startContainerElement.bind(Traverse.parent).getOrDie(),
          getNodeIndex(startContainerElement),
          startContainerElement.bind(Traverse.parent).getOrDie(),
          getNodeIndex(endContainerElement)
        );
      } else {
        return SimRange.create(
          startContainer,
          rng.startOffset,
          endContainer,
          rng.endOffset
        );
      }
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
