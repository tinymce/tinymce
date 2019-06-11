import { Range, Selection as DomSelection, Window } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as NativeRange from '../../selection/core/NativeRange';
import * as SelectionDirection from '../../selection/core/SelectionDirection';
import * as CaretRange from '../../selection/query/CaretRange';
import * as Within from '../../selection/query/Within';
import * as Prefilter from '../../selection/quirks/Prefilter';
import * as Compare from '../dom/Compare';
import * as DocumentPosition from '../dom/DocumentPosition';
import Element from '../node/Element';
import * as Fragment from '../node/Fragment';
import { Selection } from './Selection';
import { SimRange } from './SimRange';
import { Situ } from './Situ';

const doSetNativeRange = function (win: Window, rng: Range) {
  Option.from(win.getSelection()).each(function (selection) {
    selection.removeAllRanges();
    selection.addRange(rng);
  });
};

const doSetRange = function (win: Window, start: Element, soffset: number, finish: Element, foffset: number) {
  const rng = NativeRange.exactToNative(win, start, soffset, finish, foffset);
  doSetNativeRange(win, rng);
};

const findWithin = function (win: Window, selection: Selection, selector) {
  return Within.find(win, selection, selector);
};

const setLegacyRtlRange = function (win: Window, selection: DomSelection, start: Element, soffset: number, finish: Element, foffset: number) {
  selection.collapse(start.dom(), soffset);
  selection.extend(finish.dom(), foffset);
};

const setRangeFromRelative = function (win: Window, relative: Selection) {
  return SelectionDirection.diagnose(win, relative).match({
    ltr(start, soffset, finish, foffset) {
      doSetRange(win, start, soffset, finish, foffset);
    },
    rtl(start, soffset, finish, foffset) {
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

const setExact = function (win: Window, start: Element, soffset: number, finish: Element, foffset: number) {
  const relative = Prefilter.preprocessExact(start, soffset, finish, foffset);

  setRangeFromRelative(win, relative);
};

const setRelative = function (win: Window, startSitu: Situ, finishSitu: Situ) {
  const relative = Prefilter.preprocessRelative(startSitu, finishSitu);

  setRangeFromRelative(win, relative);
};

const toNative = function (selection: Selection) {
  const win: Window = Selection.getWin(selection).dom();
  const getDomRange = function (start: Element, soffset: number, finish: Element, foffset: number) {
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
const readRange = function (selection: DomSelection) {
  if (selection.rangeCount > 0) {
    const firstRng = selection.getRangeAt(0);
    const lastRng = selection.getRangeAt(selection.rangeCount - 1);

    return Option.some(SimRange.create(
      Element.fromDom(firstRng.startContainer),
      firstRng.startOffset,
      Element.fromDom(lastRng.endContainer),
      lastRng.endOffset
    ));
  } else {
    return Option.none<SimRange>();
  }
};

const doGetExact = function (selection: DomSelection) {
  const anchor = Element.fromDom(selection.anchorNode);
  const focus = Element.fromDom(selection.focusNode);

  // if this returns true anchor is _after_ focus, so we need a custom selection object to maintain the RTL selection
  return DocumentPosition.after(anchor, selection.anchorOffset, focus, selection.focusOffset) ? Option.some(
    SimRange.create(
      anchor,
      selection.anchorOffset,
      focus,
      selection.focusOffset
    )
  ) : readRange(selection);
};

const setToElement = function (win: Window, element: Element) {
  const rng = NativeRange.selectNodeContents(win, element);
  doSetNativeRange(win, rng);
};

const forElement = function (win: Window, element: Element) {
  const rng = NativeRange.selectNodeContents(win, element);
  return SimRange.create(
    Element.fromDom(rng.startContainer), rng.startOffset,
    Element.fromDom(rng.endContainer), rng.endOffset
  );
};

const getExact = function (win: Window) {
  // We want to retrieve the selection as it is.
  return Option.from(win.getSelection())
    .filter((sel) => sel.rangeCount > 0)
    .bind(doGetExact);
};

// TODO: Test this.
const get = function (win: Window) {
  return getExact(win).map(function (range) {
    return Selection.exact(range.start(), range.soffset(), range.finish(), range.foffset());
  });
};

const getFirstRect = function (win: Window, selection: Selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getFirstRect(rng);
};

const getBounds = function (win: Window, selection: Selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getBounds(rng);
};

const getAtPoint = function (win: Window, x: number, y: number) {
  return CaretRange.fromPoint(win, x, y);
};

const getAsString = function (win: Window, selection: Selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.toString(rng);
};

const clear = function (win: Window) {
  const selection = win.getSelection();
  selection.removeAllRanges();
};

const clone = function (win: Window, selection: Selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.cloneFragment(rng);
};

const replace = function (win: Window, selection: Selection, elements: Element[]) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  const fragment = Fragment.fromElements(elements, win.document);
  NativeRange.replaceWith(rng, fragment);
};

const deleteAt = function (win: Window, selection: Selection) {
  const rng = SelectionDirection.asLtrRange(win, selection);
  NativeRange.deleteContents(rng);
};

const isCollapsed = function (start: Element, soffset: number, finish: Element, foffset: number) {
  return Compare.eq(start, finish) && soffset === foffset;
};

export { setExact, getExact, get, setRelative, toNative, setToElement, clear, clone, replace, deleteAt, forElement, getFirstRect, getBounds, getAtPoint, findWithin, getAsString, isCollapsed, };
