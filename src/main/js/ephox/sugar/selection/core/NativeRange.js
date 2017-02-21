define(
  'ephox.sugar.selection.core.NativeRange',

  [
    'ephox.sugar.api.dom.Compare'
  ],

  function (Compare) {
    var selectNodeContents = function (win, element) {
      var rng = win.document.createRange();
      rng.selectNodeContents(element.dom());
      return rng;
    };

    var isCollapsed = function (start, soffset, finish, foffset) {
      return Compare.eq(start, finish) && soffset === foffset;
    };

    var relativeToNative = function (win, startSitu, finishSitu) {
      var range = win.document.create();

      startSitu.fold(function (e) {
        range.setStartBefore(e.dom());
      }, function (e, o) {
        range.setStart(e.dom(), o);
      }, function (e) {
        range.setStartAfter(e.dom());
      });

      finishSitu.fold(function (e) {
        range.setEndBefore(e.dom());
      }, function (e, o) {
        range.setEnd(e.dom(), o);
      }, function (e) {
        range.setEndAfter(e.dom());
      });

      return range;
    };

    return {
      selectNodeContents: selectNodeContents,
      isCollapsed: isCollapsed,
      relativeToNative: relativeToNative
    }
  }
);
