define(
  'ephox.sugar.api.selection.WindowSelection',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.selection.core.NativeRange',
    'ephox.sugar.selection.core.SelectionDirection',
    'ephox.sugar.selection.query.Within',
    'ephox.sugar.selection.quirks.Prefilter'
  ],

  function (
    Fun, Obj, Option, Element, Selection, Situ, NativeRange, SelectionDirection, Within,
    Prefilter
  ) {
    var doSetNativeRange = function (win, rng) {
      var selection = win.getSelection();
      selection.removeAllRanges();
      selection.addRange(rng);
    };

    var doSetRange = function (win, start, soffset, finish, foffset) {
      var rng = NativeRange.exactToNative(win, start, soffset, finish, foffset);
      doSetNativeRange(win, rng);
    };

    var findWithin = function (win, selection, selector) {
      return Within.find(win, selection, selector);
    };

    var setExact = function (win, start, soffset, finish, foffset) {
      setRelative(win, Situ.on(start, soffset), Situ.on(finish, foffset));
    };

    var setRelative = function (win, startSitu, finishSitu) {
      var relative = Prefilter.preprocess(startSitu, finishSitu);

      return SelectionDirection.diagnose(win, relative).match({
        ltr: function (start, soffset, finish, foffset) {
          doSetRange(win, start, soffset, finish, foffset);
        },
        rtl: function (start, soffset, finish, foffset) {
          var selection = win.getSelection();
          // If this selection is backwards, then we need to use extend.
          if (selection.extend) {
            selection.collapse(start.dom(), soffset);
            selection.extend(finish.dom(), foffset);
          } else {
            doSetRange(win, finish, foffset, start, soffset);
          }
        }
      });
    };

    var doGetExact = function (selection) {
      return Option.some(
        Selection.range(
          Element.fromDom(selection.anchorNode),
          selection.anchorOffset,
          Element.fromDom(selection.focusNode),
          selection.focusOffset
        )
      );
    };

    var setToElement = function (win, element) {
      var rng = NativeRange.selectNodeContents(win, element);
      doSetNativeRange(win, rng);
    };

    var getExact = function (win) {
      // We want to retrieve the selection as it is.
      var selection = win.getSelection();
      return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
    };

    var getFirstRect = function (win, selection) {
      var rng = SelectionDirection.asLtrRange(win, selection);
      return NativeRange.getFirstRect(rng);
    };

    var getBounds = function (win, selection) {
      var rng = SelectionDirection.asLtrRange(win, selection);
      return NativeRange.getBounds(rng);
    };

    return {
      setExact: setExact,
      getExact: getExact,
      setRelative: setRelative,
      setToElement: setToElement,

      getFirstRect: getFirstRect,
      getBounds: getBounds,

      findWithin: findWithin
    };
  }
);
