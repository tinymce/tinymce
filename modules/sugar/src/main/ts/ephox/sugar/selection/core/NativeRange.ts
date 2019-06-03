import { Range, Window, DOMRect, ClientRect } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import { Situ } from '../../api/selection/Situ';
import { StructRect } from '../../api/selection/Rect';

const selectNodeContents = function (win: Window, element: Element) {
  const rng = win.document.createRange();
  selectNodeContentsUsing(rng, element);
  return rng;
};

const selectNodeContentsUsing = function (rng: Range, element: Element) {
  rng.selectNodeContents(element.dom());
};

const isWithin = function (outerRange, innerRange) {
  // Adapted from: http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
  return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 &&
    innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
};

const create = function (win: Window) {
  return win.document.createRange();
};

// NOTE: Mutates the range.
const setStart = function (rng: Range, situ: Situ) {
  situ.fold(function (e) {
    rng.setStartBefore(e.dom());
  }, function (e, o) {
    rng.setStart(e.dom(), o);
  }, function (e) {
    rng.setStartAfter(e.dom());
  });
};

const setFinish = function (rng: Range, situ: Situ) {
  situ.fold(function (e) {
    rng.setEndBefore(e.dom());
  }, function (e, o) {
    rng.setEnd(e.dom(), o);
  }, function (e) {
    rng.setEndAfter(e.dom());
  });
};

const replaceWith = function (rng: Range, fragment: Element) {
  // Note: this document fragment approach may not work on IE9.
  deleteContents(rng);
  rng.insertNode(fragment.dom());
};

const relativeToNative = function (win: Window, startSitu: Situ, finishSitu: Situ) {
  const range = win.document.createRange();
  setStart(range, startSitu);
  setFinish(range, finishSitu);
  return range;
};

const exactToNative = function (win: Window, start: Element, soffset: number, finish: Element, foffset: number) {
  const rng = win.document.createRange();
  rng.setStart(start.dom(), soffset);
  rng.setEnd(finish.dom(), foffset);
  return rng;
};

const deleteContents = function (rng: Range) {
  rng.deleteContents();
};

const cloneFragment = function (rng: Range) {
  const fragment = rng.cloneContents();
  return Element.fromDom(fragment);
};

const toRect = function (rect: ClientRect | DOMRect): StructRect {
  return {
    left: Fun.constant(rect.left),
    top: Fun.constant(rect.top),
    right: Fun.constant(rect.right),
    bottom: Fun.constant(rect.bottom),
    width: Fun.constant(rect.width),
    height: Fun.constant(rect.height)
  };
};

const getFirstRect = function (rng: Range) {
  const rects = rng.getClientRects();
  // ASSUMPTION: The first rectangle is the start of the selection
  const rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0  ? Option.some(rect).map(toRect) : Option.none<StructRect>();
};

const getBounds = function (rng: Range) {
  const rect = rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0  ? Option.some(rect).map(toRect) : Option.none<StructRect>();
};

const toString = function (rng: Range) {
  return rng.toString();
};

export { create, replaceWith, selectNodeContents, selectNodeContentsUsing, relativeToNative, exactToNative, deleteContents, cloneFragment, getFirstRect, getBounds, isWithin, toString, };
