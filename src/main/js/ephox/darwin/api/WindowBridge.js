define(
  'ephox.darwin.api.WindowBridge',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.api.selection.WindowSelection',
    'ephox.sugar.selection.core.SelectionDirection'
  ],

  function (Fun, Obj, Selection, Situ, WindowSelection, SelectionDirection) {
    // TODO: Move out of API


    return function (win) {
      var getRect = function (element) {
        return element.dom().getBoundingClientRect();
      };

      // INVESTIGATE
      /*
       Before: (Elem, Int, Elem, Int) -> Option NativeRect

       After: (Elem, Int, Elem, Int) ->  Option (Structified NativeRect)
          now: Option NativeRect
       */
      var getRangedRect = function (start, soffset, finish, foffset) {
        var sel = Selection.exact(start, soffset, finish, foffset);
        return WindowSelection.getFirstRect(win, sel).map(function (structRect) {
          return Obj.map(structRect, Fun.apply);
        });
      };

      var convertToRange = function (win, selection) {
        // TODO: Use API packages of sugar
        var rng = SelectionDirection.asLtrRange(win, selection);
        return {
          start: Fun.constant(rng.startContainer),
          soffset: Fun.constant(rng.startOffset),
          finish: Fun.constant(rng.endContainer),
          foffset: Fun.constant(rng.endOffset)
        };
      };

      /*
       Before :() -> Option (start(), soffset(), finish(), foffset())

       After : () -> Option (ExactADT: start(), soffset(), finish(), foffset())
          no: Option (start(), soffset(), finish(), foffset())
      */
      var getSelection = function () {
        return WindowSelection.get(win).map(function (exactAdt) {
          return convertToRange(win, exactAdt);
        });
      };

      /*
       Before: ({start: Situ, finish: Situ}) -> Option (start(), soffset(), finish(), foffset())

       After:  ({start: Situ, finish: Situ}) -> Option (start(), soffset(), finish(), foffset())


       */
      var fromSitus = function (situs) {
        var relative = Selection.relative(situs.start(), situs.finish());
        return convertToRange(relative);
      };

      // INVESTIGATE BEFORE MERGING
      /*
        Before: (Int, Int) -> Option { start(): Situ, finish(): Situ }

        After: (Int, Int) -> Option { start(): Situ, finish(): Situ }
      */
      var situsFromPoint = function (x, y) {
        return WindowSelection.getAtPoint(win, x, y).map(function (exact) {
          return {
            start: Fun.constant(Situ.on(exact.start(), exact.soffset())),
            finish: Fun.constant(Situ.on(exact.finish(), exact.foffset()))
          };
        });
      };

      var clearSelection = function () {
        WindowSelection.clear(win);
      };

      var selectContents = function (element) {
        WindowSelection.setToElement(win, element);
      };

      var setSelection = function (sel) {
        WindowSelection.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
      };

      var setRelativeSelection = function (start, finish) {
        WindowSelection.setRelative(win, start, finish);
      };

      var getInnerHeight = function () {
        return win.innerHeight;
      };

      var getScrollY = function () {
        return win.scrollY;
      };

      var scrollBy = function (x, y) {
        win.scrollBy(x, y);
      };

      return {
        getRect: getRect,
        getRangedRect: getRangedRect,
        getSelection: getSelection,
        fromSitus: fromSitus,
        situsFromPoint: situsFromPoint,
        clearSelection: clearSelection,
        setSelection: setSelection,
        setRelativeSelection: setRelativeSelection,
        selectContents: selectContents,
        getInnerHeight: getInnerHeight,
        getScrollY: getScrollY,
        scrollBy: scrollBy
      };
    };
  }
);