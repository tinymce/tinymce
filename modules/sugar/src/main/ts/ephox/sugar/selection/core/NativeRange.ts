import { ClientRect, DOMRect, Node as DomNode, Range, Window } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import { StructRect } from '../../api/selection/Rect';
import { Situ } from '../../api/selection/Situ';

const selectNodeContents = (win: Window, element: Element<DomNode>) => {
  const rng = win.document.createRange();
  selectNodeContentsUsing(rng, element);
  return rng;
};

const selectNodeContentsUsing = (rng: Range, element: Element<DomNode>) => rng.selectNodeContents(element.dom());

const isWithin = (outerRange: Range, innerRange: Range) =>
  // Adapted from: http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
  innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;

const create = (win: Window) => win.document.createRange();

// NOTE: Mutates the range.
const setStart = (rng: Range, situ: Situ) => {
  situ.fold((e) => {
    rng.setStartBefore(e.dom());
  }, (e, o) => {
    rng.setStart(e.dom(), o);
  }, (e) => {
    rng.setStartAfter(e.dom());
  });
};

const setFinish = (rng: Range, situ: Situ) => {
  situ.fold((e) => {
    rng.setEndBefore(e.dom());
  }, (e, o) => {
    rng.setEnd(e.dom(), o);
  }, (e) => {
    rng.setEndAfter(e.dom());
  });
};

const replaceWith = (rng: Range, fragment: Element<DomNode>) => {
  // Note: this document fragment approach may not work on IE9.
  deleteContents(rng);
  rng.insertNode(fragment.dom());
};

const relativeToNative = (win: Window, startSitu: Situ, finishSitu: Situ) => {
  const range = win.document.createRange();
  setStart(range, startSitu);
  setFinish(range, finishSitu);
  return range;
};

const exactToNative = (win: Window, start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => {
  const rng = win.document.createRange();
  rng.setStart(start.dom(), soffset);
  rng.setEnd(finish.dom(), foffset);
  return rng;
};

const deleteContents = (rng: Range) => {
  rng.deleteContents();
};

const cloneFragment = (rng: Range) => {
  const fragment = rng.cloneContents();
  return Element.fromDom(fragment);
};

const toRect = (rect: ClientRect | DOMRect): StructRect => ({
  left: Fun.constant(rect.left),
  top: Fun.constant(rect.top),
  right: Fun.constant(rect.right),
  bottom: Fun.constant(rect.bottom),
  width: Fun.constant(rect.width),
  height: Fun.constant(rect.height)
});

const getFirstRect = (rng: Range) => {
  const rects = rng.getClientRects();
  // ASSUMPTION: The first rectangle is the start of the selection
  const rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none<StructRect>();
};

const getBounds = (rng: Range) => {
  const rect = rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none<StructRect>();
};

const toString = (rng: Range) => rng.toString();

export { create, replaceWith, selectNodeContents, selectNodeContentsUsing, relativeToNative, exactToNative, deleteContents, cloneFragment, getFirstRect, getBounds, isWithin, toString };
