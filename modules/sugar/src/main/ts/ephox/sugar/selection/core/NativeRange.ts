import { Optional } from '@ephox/katamari';
import { SugarElement } from '../../api/node/SugarElement';
import { RawRect } from '../../api/selection/Rect';
import { Situ } from '../../api/selection/Situ';

const selectNodeContents = (win: Window, element: SugarElement<Node>) => {
  const rng = win.document.createRange();
  selectNodeContentsUsing(rng, element);
  return rng;
};

const selectNodeContentsUsing = (rng: Range, element: SugarElement<Node>) => rng.selectNodeContents(element.dom);

const isWithin = (outerRange: Range, innerRange: Range) =>
  // Adapted from: http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
  innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;

const create = (win: Window) => win.document.createRange();

// NOTE: Mutates the range.
const setStart = (rng: Range, situ: Situ) => {
  situ.fold((e) => {
    rng.setStartBefore(e.dom);
  }, (e, o) => {
    rng.setStart(e.dom, o);
  }, (e) => {
    rng.setStartAfter(e.dom);
  });
};

const setFinish = (rng: Range, situ: Situ) => {
  situ.fold((e) => {
    rng.setEndBefore(e.dom);
  }, (e, o) => {
    rng.setEnd(e.dom, o);
  }, (e) => {
    rng.setEndAfter(e.dom);
  });
};

const replaceWith = (rng: Range, fragment: SugarElement<Node>) => {
  // Note: this document fragment approach may not work on IE9.
  deleteContents(rng);
  rng.insertNode(fragment.dom);
};

const relativeToNative = (win: Window, startSitu: Situ, finishSitu: Situ) => {
  const range = win.document.createRange();
  setStart(range, startSitu);
  setFinish(range, finishSitu);
  return range;
};

const exactToNative = (win: Window, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => {
  const rng = win.document.createRange();
  rng.setStart(start.dom, soffset);
  rng.setEnd(finish.dom, foffset);
  return rng;
};

const deleteContents = (rng: Range) => {
  rng.deleteContents();
};

const cloneFragment = (rng: Range) => {
  const fragment = rng.cloneContents();
  return SugarElement.fromDom(fragment);
};

const toRect = (rect: ClientRect | DOMRect): RawRect => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom,
  width: rect.width,
  height: rect.height
});

const getFirstRect = (rng: Range): Optional<RawRect> => {
  const rects = rng.getClientRects();
  // ASSUMPTION: The first rectangle is the start of the selection
  const rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0 ? Optional.some(rect).map(toRect) : Optional.none();
};

const getBounds = (rng: Range): Optional<RawRect> => {
  const rect = rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0 ? Optional.some(rect).map(toRect) : Optional.none();
};

const toString = (rng: Range) => rng.toString();

export { create, replaceWith, selectNodeContents, selectNodeContentsUsing, relativeToNative, exactToNative, deleteContents, cloneFragment, getFirstRect, getBounds, isWithin, toString };
