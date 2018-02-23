import { Option } from '@ephox/katamari';
import DocumentPosition from '../dom/DocumentPosition';
import Element from '../node/Element';
import Fragment from '../node/Fragment';
import Traverse from '../search/Traverse';
import Selection from './Selection';
import NativeRange from '../../selection/core/NativeRange';
import SelectionDirection from '../../selection/core/SelectionDirection';
import CaretRange from '../../selection/query/CaretRange';
import Within from '../../selection/query/Within';
import Prefilter from '../../selection/quirks/Prefilter';
import Compare from '../dom/Compare';

var doSetNativeRange = function (win, rng) {
  Option.from(win.getSelection()).each(function(selection) {
    selection.removeAllRanges();
    selection.addRange(rng);
  });
};

var doSetRange = function (win, start, soffset, finish, foffset) {
  var rng = NativeRange.exactToNative(win, start, soffset, finish, foffset);
  doSetNativeRange(win, rng);
};

var findWithin = function (win, selection, selector) {
  return Within.find(win, selection, selector);
};

var setRangeFromRelative = function (win, relative) {
  return SelectionDirection.diagnose(win, relative).match({
    ltr: function (start, soffset, finish, foffset) {
      doSetRange(win, start, soffset, finish, foffset);
    },
    rtl: function (start, soffset, finish, foffset) {
      var selection = win.getSelection();
      // If this selection is backwards, then we need to use extend.
      if (selection.setBaseAndExtent) {
        selection.setBaseAndExtent(start.dom(), soffset, finish.dom(), foffset);
      } else if (selection.extend) {
        selection.collapse(start.dom(), soffset);
        selection.extend(finish.dom(), foffset);
      } else {
        doSetRange(win, finish, foffset, start, soffset);
      }
    }
  });
};

var setExact = function (win, start, soffset, finish, foffset) {
  var relative = Prefilter.preprocessExact(start, soffset, finish, foffset);

  setRangeFromRelative(win, relative);
};

var setRelative = function (win, startSitu, finishSitu) {
  var relative = Prefilter.preprocessRelative(startSitu, finishSitu);

  setRangeFromRelative(win, relative);
};

var toNative = function (selection) {
  var win = Selection.getWin(selection).dom();
  var getDomRange = function (start, soffset, finish, foffset) {
    return NativeRange.exactToNative(win, start, soffset, finish, foffset);
  };
  var filtered = Prefilter.preprocess(selection);
  return SelectionDirection.diagnose(win, filtered).match({
    ltr: getDomRange,
    rtl: getDomRange
  });
};

// NOTE: We are still reading the range because it gives subtly different behaviour
// than using the anchorNode and focusNode. I'm not sure if this behaviour is any
// better or worse; it's just different.
var readRange = function (selection) {
  if (selection.rangeCount > 0) {
    var firstRng = selection.getRangeAt(0);
    var lastRng = selection.getRangeAt(selection.rangeCount - 1);

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

var doGetExact = function (selection) {
  var anchorNode = Element.fromDom(selection.anchorNode);
  var focusNode = Element.fromDom(selection.focusNode);
  return DocumentPosition.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some(
    Selection.range(
      Element.fromDom(selection.anchorNode),
      selection.anchorOffset,
      Element.fromDom(selection.focusNode),
      selection.focusOffset
    )
  ) : readRange(selection);
};

var setToElement = function (win, element) {
  var rng = NativeRange.selectNodeContents(win, element);
  doSetNativeRange(win, rng);
};

var forElement = function (win, element) {
  var rng = NativeRange.selectNodeContents(win, element);
  return Selection.range(
    Element.fromDom(rng.startContainer), rng.startOffset,
    Element.fromDom(rng.endContainer), rng.endOffset
  );
};

var getExact = function (win) {
  // We want to retrieve the selection as it is.
  var selection = win.getSelection();
  return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
};

// TODO: Test this.
var get = function (win) {
  return getExact(win).map(function (range) {
    return Selection.exact(range.start(), range.soffset(), range.finish(), range.foffset());
  });
};

var getFirstRect = function (win, selection) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getFirstRect(rng);
};

var getBounds = function (win, selection) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.getBounds(rng);
};

var getAtPoint = function (win, x, y) {
  return CaretRange.fromPoint(win, x, y);
};

var getAsString = function (win, selection) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.toString(rng);
};

var clear = function (win) {
  var selection = win.getSelection();
  selection.removeAllRanges();
};

var clone = function (win, selection) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  return NativeRange.cloneFragment(rng);
};

var replace = function (win, selection, elements) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  var fragment = Fragment.fromElements(elements, win.document);
  NativeRange.replaceWith(rng, fragment);
};

var deleteAt = function (win, selection) {
  var rng = SelectionDirection.asLtrRange(win, selection);
  NativeRange.deleteContents(rng);
};

var isCollapsed = function (start, soffset, finish, foffset) {
  return Compare.eq(start, finish) && soffset === foffset;
};

export default <any> {
  setExact: setExact,
  getExact: getExact,
  get: get,
  setRelative: setRelative,
  toNative: toNative,
  setToElement: setToElement,
  clear: clear,

  clone: clone,
  replace: replace,
  deleteAt: deleteAt,

  forElement: forElement,

  getFirstRect: getFirstRect,
  getBounds: getBounds,
  getAtPoint: getAtPoint,

  findWithin: findWithin,
  getAsString: getAsString,

  isCollapsed: isCollapsed
};