import { Option } from '@ephox/katamari';
import * as DocumentPosition from '../dom/DocumentPosition';
import Element from '../node/Element';
import * as Fragment from '../node/Fragment';
import * as Selection from './Selection';
import * as NativeRange from '../../selection/core/NativeRange';
import * as SelectionDirection from '../../selection/core/SelectionDirection';
import * as CaretRange from '../../selection/query/CaretRange';
import * as Within from '../../selection/query/Within';
import * as Prefilter from '../../selection/quirks/Prefilter';
import * as Compare from '../dom/Compare';

const doSetNativeRange = function (win, rng) {
  Option.from(win.getSelection()).each(function (selection) {
    selection.removeAllRanges();
    selection.addRange(rng);
  });
};

const doSetRange = function (win, start, soffset, finish, foffset) {
  const rng = NativeRange.exactToNative(win, start, soffset, finish, foffset);
  doSetNativeRange(win, rng);
};

const findWithin = function (win, selection, selector) {
  return Within.find(win, selection, selector);
};

const setLegacyRtlRange = function (win, selection, start, soffset, finish, foffset) {
    selection.collapse(start.dom(), soffset);
    selection.extend(finish.dom(), foffset);
};

const setRangeFromRelative = function (win, relative) {
  return SelectionDirection.diagnose(win, relative).match({
    ltr (start, soffset, finish, foffset) {
      doSetRange(win, start, soffset, finish, foffset);
    },
    rtl (start, soffset, finish, foffset) {
      const selection = win.getSelection();
      // If this selection is backwards, then we need to use extend.
      if (selection.setBaseAndExtent) {
        selection.setBaseAndExtent(start.dom(), soffset, finish.dom(), foffset);
      } else if (selection.extend) {
        // This try catch is for older browsers (Firefox 52) as they're sometimes unable to handle setting backwards selections using selection.extend and error out.
        try {
          setLegacyRtlRange(win, selection, start, soffset, finish, foffset);
        } catch (e) {
          // If it does fail, try again with ltr.
          doSetRange(win, finish, foffset, start, soffset);
        }
      } else {
        doSetRange(win, finish, foffset, start, soffset);
      }
    }
  });
};

const setExact = function (win, start, soffset, finish, foffset) {
  const relative = Prefilter.preprocessExact(start, soffset, finish, foffset);

  setRangeFromRelative(win, relative);
};

const setRelative = function (win, startSitu, finishSitu) {
  const relative = Prefilter.preprocessRelative(startSitu, finishSitu);

  setRangeFromRelative(win, relative);
};

const toNative = function (selection) {
  const win = Selection.getWin(selection).dom();
  const getDomRange = function (start, soffset, finish, foffset) {
    return NativeRange.exactToNative(win, start, soffset, finish, foffset);
  };
  const filtered = Prefilter.preprocess(selection);
  return SelectionDirection.diagnose(win, filtered).match({
    ltr: getDomRange,
    rtl: getDomRange
  });
};

// NOTE: We are still reading the range because it gives subtly different behaviour
// than using the anchorNode and focusNode. I'm not sure if this behaviour is any
// better or worse; it's just different.
const readRange = function (selection) {
  if (selection.rangeCount > 0) {
    const firstRng = selection.getRangeAt(0);
    const lastRng = selection.getRangeAt(selection.rangeCount - 1);

    return Option.some(Selection.range(
      Element.fromDom(firstRng.startContainer),
      firstRng.startOffset,
      Element.fromDom(lastRng.endContainer),
      lastRng.endOffset
    ));
  } else {
    return Option.none();
  }
};

const doGetExact = function (selection) {
  const anchor = Element.fromDom(selection.anchorNode);
  const focus = Element.fromDom(selection.focusNode);

  // if this returns true anchor is _after_ focus, so we need a custom selection object to maintain the RTL selection
  return DocumentPosition.after(anchor, selection.anchorOffset, focus, selection.focusOffset) ? Option.some(
    Selection.range(
      anchor,
      selection.anchorOffset,
      focus,
      selection.focusOffset
    )
  ) : readRange(selection);
};

const setToElement = function (win, element) {
  const rng = NativeRange.selectNodeContents(win, element);
  doSetNativeRange(win, rng);
};

const forElement = function (win, element) {
  const rng = NativeRange.selectNodeContents(win, element);
  return Selection.range(
    Element.fromDom(rng.startContainer), rng.startOffset,
    Element.fromDom(rng.endContainer), rng.endOffset
  );
};

const getExact = function (win) {
  // We want to retrieve the selection as it is.
  return Option.from(win.getSelection())
    .filter((sel) => sel.rangeCount > 0)
    .bind(doGetExact);
};

// TODO: Test this.
const get = function (win) {
  return getExact(win).map(function (range) {
    return Selection.exact(range.start(), range.soffset(), range.finish(), range.foffset());
  });
};

const getFirstRect = function (win, selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getFirstRect(rng);
};

const getBounds = function (win, selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getBounds(rng);
};

const getAtPoint = function (win, x, y) {
  return CaretRange.fromPoint(win, x, y);
};

const getAsString = function (win, selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.toString(rng);
};

const clear = function (win) {
  const selection = win.getSelection();
  selection.removeAllRanges();
};

const clone = function (win, selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.cloneFragment(rng);
};

const replace = function (win, selection, elements) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  const fragment = Fragment.fromElements(elements, win.document);
  NativeRange.replaceWith(rng, fragment);
};

const deleteAt = function (win, selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  NativeRange.deleteContents(rng);
};

const isCollapsed = function (start: Element, soffset: number, finish: Element, foffset: number) {
  return Compare.eq(start, finish) && soffset === foffset;
};

export {
  setExact,
  getExact,
  get,
  setRelative,
  toNative,
  setToElement,
  clear,

  clone,
  replace,
  deleteAt,

  forElement,

  getFirstRect,
  getBounds,
  getAtPoint,

  findWithin,
  getAsString,

  isCollapsed,
};