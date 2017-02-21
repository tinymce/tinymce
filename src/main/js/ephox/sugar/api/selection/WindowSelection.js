define(
  'ephox.sugar.api.selection.WindowSelection',

  [
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.selection.core.SelectionDirection',
    'ephox.sugar.selection.quirks.Prefilter'
  ],

  function (Situ, SelectionDirection, Prefilter) {
    var set = function (win, start, soffset, finish, foffset) {
      setRelative(win, Situ.on(start, soffset), Situ.on(finish, foffset));
    };

    var doSetRange = function (win, start, soffset, finish, foffset) {
      var selection = win.getSelection();
      var rng = win.document.createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      selection.removeAllRanges();
      selection.addRange(rng);
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

    return {
      set: set,
      setRelative: setRelative
    };
  }
);
