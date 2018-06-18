import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import { Range, Window } from '@ephox/dom-globals';

var selectNodeContents = function (win: Window, element: Element) {
  var rng = win.document.createRange();
  selectNodeContentsUsing(rng, element);
  return rng;
};

var selectNodeContentsUsing = function (rng: Range, element: Element) {
  rng.selectNodeContents(element.dom());
};

var isWithin = function (outerRange, innerRange) {
  // Adapted from: http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
  return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 &&
    innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
};

var create = function (win) {
  return win.document.createRange();
};

// NOTE: Mutates the range.
var setStart = function (rng, situ) {
  situ.fold(function (e) {
    rng.setStartBefore(e.dom());
  }, function (e, o) {
    rng.setStart(e.dom(), o);
  }, function (e) {
    rng.setStartAfter(e.dom());
  });
};

var setFinish = function (rng, situ) {
  situ.fold(function (e) {
    rng.setEndBefore(e.dom());
  }, function (e, o) {
    rng.setEnd(e.dom(), o);
  }, function (e) {
    rng.setEndAfter(e.dom());
  });
};

var replaceWith = function (rng: Range, fragment: Element) {
  // Note: this document fragment approach may not work on IE9.
  deleteContents(rng);
  rng.insertNode(fragment.dom());
};

var relativeToNative = function (win: Window, startSitu, finishSitu) {
  var range = win.document.createRange();
  setStart(range, startSitu);
  setFinish(range, finishSitu);
  return range;
};

var exactToNative = function (win: Window, start: Element, soffset: number, finish: Element, foffset: number) {
  var rng = win.document.createRange();
  rng.setStart(start.dom(), soffset);
  rng.setEnd(finish.dom(), foffset);
  return rng;
};

var deleteContents = function (rng: Range) {
  rng.deleteContents();
};

var cloneFragment = function (rng: Range) {
  var fragment = rng.cloneContents();
  return Element.fromDom(fragment);
};

var toRect = function (rect) {
  return {
    left: Fun.constant(rect.left),
    top: Fun.constant(rect.top),
    right: Fun.constant(rect.right),
    bottom: Fun.constant(rect.bottom),
    width: Fun.constant(rect.width),
    height: Fun.constant(rect.height)
  };
};

var getFirstRect = function (rng: Range) {
  var rects = rng.getClientRects();
  // ASSUMPTION: The first rectangle is the start of the selection
  var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0  ? Option.some(rect).map(toRect) : Option.none();
};

var getBounds = function (rng: Range) {
  var rect = rng.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0  ? Option.some(rect).map(toRect) : Option.none();
};

var toString = function (rng: Range) {
  return rng.toString();
};

export default {
  create,
  replaceWith,
  selectNodeContents,
  selectNodeContentsUsing,
  relativeToNative,
  exactToNative,
  deleteContents,
  cloneFragment,
  getFirstRect,
  getBounds,
  isWithin,
  toString,
};