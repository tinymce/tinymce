define(
  'ephox.sugar.selection.core.NativeRange',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element'
  ],

  function (Option, Compare, Element) {
    var selectNodeContents = function (win, element) {
      var rng = win.document.createRange();
      selectNodeContentsUsing(rng, element);
      return rng;
    };

    var selectNodeContentsUsing = function (rng, element) {
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

    var replaceWith = function (rng, fragment) {
      // Note: this document fragment approach may not work on IE9.
      deleteContents(rng);
      rng.insertNode(fragment.dom());
    };

    var isCollapsed = function (start, soffset, finish, foffset) {
      return Compare.eq(start, finish) && soffset === foffset;
    };

    var relativeToNative = function (win, startSitu, finishSitu) {
      var range = win.document.createRange();
      setStart(range, startSitu);
      setFinish(range, finishSitu);
      return range;
    };

    var deleteContents = function (rng) {
      rng.deleteContents();
    };

    var cloneFragment = function (rng) {
      var fragment = rng.cloneContents();
      return Element.fromDom(fragment);
    };
    
    var getFirstRect = function (rng) {
      var rects = rng.getClientRects();
      // ASSUMPTION: The first rectangle is the start of the selection
      var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0  ? Option.some(rect) : Option.none();
    };

    var getBounds = function (rng) {
      var rect = rng.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0  ? Option.some(rect) : Option.none();
    };

    return {
      create: create,
      replaceWith: replaceWith,
      selectNodeContents: selectNodeContents,
      selectNodeContentsUsing: selectNodeContentsUsing,
      isCollapsed: isCollapsed,
      relativeToNative: relativeToNative,
      deleteContents: deleteContents,
      cloneFragment: cloneFragment,
      getFirstRect: getFirstRect,
      getBounds: getBounds,
      isWithin: isWithin
    };
  }
);
