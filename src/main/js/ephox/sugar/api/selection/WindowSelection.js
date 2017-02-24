define(
  'ephox.sugar.api.selection.WindowSelection',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.DocumentPosition',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.selection.core.NativeRange',
    'ephox.sugar.selection.core.SelectionDirection',
    'ephox.sugar.selection.query.CaretRange',
    'ephox.sugar.selection.query.Within',
    'ephox.sugar.selection.quirks.Prefilter'
  ],

  function (Option, DocumentPosition, Element, Fragment, Selection, Situ, NativeRange, SelectionDirection, CaretRange, Within, Prefilter) {
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

    // NOTE: We are still reading the range because it gives subtly different behaviour
    // than using the anchorNode and focusNode. I'm not sure if this behaviour is any
    // better or worse; it's just different.
    var readRange = function (selection) {
      var rng = Option.from(selection.getRangeAt(0));
      return rng.map(function (r) {
        return Selection.range(Element.fromDom(r.startContainer), r.startOffset, Element.fromDom(r.endContainer), r.endOffset);
      });
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
      var fragment = Fragment.fromElements(elements);
      NativeRange.replaceWith(rng, fragment);
    };

    var deleteAt = function (win, selection) {
      var rng = SelectionDirection.asLtrRange(win, selection);
      NativeRange.deleteContents(rng);
    };

    return {
      setExact: setExact,
      getExact: getExact,
      get: get,
      setRelative: setRelative,
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
      getAsString: getAsString
    };
  }
);
