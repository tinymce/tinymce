define(
  'ephox.darwin.api.WindowBridge',

  [
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection'
  ],

  function (Selection, WindowSelection) {
    return function (win) {
      var getRect = function (element) {
        return element.dom().getBoundingClientRect();
      };

      var getRangedRect = function (start, soffset, finish, foffset) {
        var sel = Selection.exact(start, soffset, finish, foffset);
        return WindowSelection.getFirstRect(win, sel);
      };

      var getSelection = function () {
        return WindowSelection.get(win);
      };

      var fromSitus = function (situs) {
        return Selection.exact(situs.start(), situs.soffset(), situs.finish(), situs.foffset());
      };

      var situsFromPoint = function (x, y) {
        return WindowSelection.getAtPoint(win, x, y);
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