define(
  'ephox.sugar.api.selection.WindowSelection',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.selection.core.NativeRange',
    'ephox.sugar.selection.core.SelectionDirection',
    'ephox.sugar.selection.query.Within',
    'ephox.sugar.selection.quirks.Prefilter'
  ],

  function (Option, Element, Selection, Situ, NativeRange, SelectionDirection, Within, Prefilter) {
    var set = function (win, start, soffset, finish, foffset) {
      setRelative(win, Situ.on(start, soffset), Situ.on(finish, foffset));
    };

    var doSetNativeRange = function (win, rng) {
      var selection = win.getSelection();
      selection.removeAllRanges();
      selection.addRange(rng);
    };

    var doSetRange = function (win, start, soffset, finish, foffset) {
      var rng = win.document.createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      doSetNativeRange(win, rng);
    };

    var findWithinRelative = function (win, relative, selector) {
      // Note, we don't need the getSelection() model for this.
      return Within.find(win, relative, selector);
    };

    var findWithin = function (win, s, so, e, eo, selector) {
      var relative = Selection.relative(
        Situ.on(s, so),
        Situ.on(e, eo)
      );
      // Note, we don't need the getSelection() model for this.
      return findWithinRelative(win, relative, selector);
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

    var doGet = function (selection) {
      return Option.some(
        Selection.exact(
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

    var get = function (win) {
      // We want to retrieve the selection as it is.
      var selection = win.getSelection();
      return selection.rangeCount > 0 ? doGet(selection) : Option.none();
    };

    return {
      set: set,
      get: get,
      setRelative: setRelative,
      setToElement: setToElement,

      // TODO: Start testing these.
      findWithinRelative: findWithinRelative,
      findWithin: findWithin
    };
  }
);
