define(
  'tinymce.core.selection.SelectionBookmark',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.dom.DOMUtils'
  ],

  function (Option, Compare, Element, Node, Text, Traverse, Selection, WindowSelection, CaretContainer, DOMUtils) {
    var clamp = function (offset, element) {
      var max = Node.isText(element) ? Text.get(element).length : Traverse.children(element).length + 1;

      if (offset > max) {
        return max;
      } else if (offset < 0) {
        return 0;
      }

      return offset;
    };

    var normalizeRng = function (rng) {
      return Selection.range(
        rng.start(),
        clamp(rng.soffset(), rng.start()),
        rng.finish(),
        clamp(rng.foffset(), rng.finish())
      );
    };

    var isOrContains = function (root, elm) {
      return Compare.contains(root, elm) || Compare.eq(root, elm);
    };

    var isRngInRoot = function (root) {
      return function (rng) {
        return isOrContains(root, rng.start()) && isOrContains(root, rng.finish());
      };
    };

    // var dumpRng = function (rng) {
    //   console.log('start', rng.start().dom());
    //   console.log('soffset', rng.soffset());
    //   console.log('finish', rng.finish().dom());
    //   console.log('foffset', rng.foffset());
    //   return rng;
    // };

    var getBookmark = function (root) {
      var win = Traverse.defaultView(root);

      return WindowSelection.getExact(win.dom())
        .filter(isRngInRoot(root));
    };

    var setBookmark = function (root, bookmark) {
      var win = Traverse.defaultView(root);

      validate(root, bookmark)
        .each(function (rng) {
          WindowSelection.setExact(win.dom(), rng.start(), rng.soffset(), rng.finish(), rng.foffset());
        });
    };

    var validate = function (root, bookmark) {
      return Option.from(bookmark)
          .filter(isRngInRoot(root))
          .map(normalizeRng);
    };

    var bookmarkToNativeRng = function (bookmark) {
      var rng = document.createRange();
      rng.setStart(bookmark.start().dom(), bookmark.soffset());
      rng.setEnd(bookmark.finish().dom(), bookmark.foffset());

      return Option.some(rng);
    };

    var hasSelection = function (root) {
      return getBookmark(root).isSome();
    };

    return {
      getBookmark: getBookmark,
      setBookmark: setBookmark,
      validate: validate,
      bookmarkToNativeRng: bookmarkToNativeRng,
      hasSelection: hasSelection
    };
  }
);
