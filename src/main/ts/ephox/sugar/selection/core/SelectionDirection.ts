import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Thunk } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as NativeRange from './NativeRange';
import { Window, Range } from '@ephox/dom-globals';

var adt = Adt.generate([
  { ltr: [ 'start', 'soffset', 'finish', 'foffset' ] },
  { rtl: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

var fromRange = function (win, type, range: Range) {
  return type(Element.fromDom(range.startContainer), range.startOffset, Element.fromDom(range.endContainer), range.endOffset);
};

var getRanges = function (win: Window, selection) {
  return selection.match({
    domRange: function (rng) {
      return {
        ltr: Fun.constant(rng),
        rtl: Option.none
      };
    },
    relative: function (startSitu, finishSitu) {
      return {
        ltr: Thunk.cached(function () {
          return NativeRange.relativeToNative(win, startSitu, finishSitu);
        }),
        rtl: Thunk.cached(function () {
          return Option.some(
            NativeRange.relativeToNative(win, finishSitu, startSitu)
          );
        })
      };
    },
    exact: function (start: Element, soffset: number, finish: Element, foffset: number) {
      return {
        ltr: Thunk.cached(function () {
          return NativeRange.exactToNative(win, start, soffset, finish, foffset);
        }),
        rtl: Thunk.cached(function () {
          return Option.some(
            NativeRange.exactToNative(win, finish, foffset, start, soffset)
          );
        })
      };
    }
  });
};

var doDiagnose = function (win: Window, ranges) {
  // If we cannot create a ranged selection from start > finish, it could be RTL
  var rng = ranges.ltr();
  if (rng.collapsed) {
    // Let's check if it's RTL ... if it is, then reversing the direction will not be collapsed
    var reversed = ranges.rtl().filter(function (rev) {
      return rev.collapsed === false;
    });

    return reversed.map(function (rev) {
      // We need to use "reversed" here, because the original only has one point (collapsed)
      return adt.rtl(
        Element.fromDom(rev.endContainer), rev.endOffset,
        Element.fromDom(rev.startContainer), rev.startOffset
      );
    }).getOrThunk(function () {
      return fromRange(win, adt.ltr, rng);
    });
  } else {
    return fromRange(win, adt.ltr, rng);
  }
};

var diagnose = function (win: Window, selection) {
  var ranges = getRanges(win, selection);
  return doDiagnose(win, ranges);
};

var asLtrRange = function (win: Window, selection) {
  var diagnosis = diagnose(win, selection);
  return diagnosis.match({
    ltr: function (start: Element, soffset: number, finish: Element, foffset: number) {
      var rng = win.document.createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      return rng;
    },
    rtl: function (start: Element, soffset: number, finish: Element, foffset: number) {
      // NOTE: Reversing start and finish
      var rng = win.document.createRange();
      rng.setStart(finish.dom(), foffset);
      rng.setEnd(start.dom(), soffset);
      return rng;
    }
  });
};

const ltr = adt.ltr;
const rtl = adt.rtl;

export {
  ltr,
  rtl,
  diagnose,
  asLtrRange,
};