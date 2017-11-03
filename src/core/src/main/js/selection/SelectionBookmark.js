define(
  'tinymce.core.selection.SelectionBookmark',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Selection',
    'global!document'
  ],

  function (Fun, Option, PlatformDetection, Compare, Element, Node, Text, Traverse, Selection, document) {
    var browser = PlatformDetection.detect().browser;

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

    var shouldStore = function (editor) {
      return editor.inline === true || browser.isIE();
    };

    var nativeRangeToSelectionRange = function (r) {
      return Selection.range(Element.fromDom(r.startContainer), r.startOffset, Element.fromDom(r.endContainer), r.endOffset);
    };

    var readRange = function (win) {
      var selection = win.getSelection();
      var rng = !selection || selection.rangeCount === 0 ? Option.none() : Option.from(selection.getRangeAt(0));
      return rng.map(nativeRangeToSelectionRange);
    };

    var getBookmark = function (root) {
      var win = Traverse.defaultView(root);

      return readRange(win.dom())
        .filter(isRngInRoot(root));
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

    var store = function (editor) {
      var newBookmark = shouldStore(editor) ? getBookmark(Element.fromDom(editor.getBody())) : Option.none();

      editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
    };

    var storeNative = function (editor, rng) {
      var root = Element.fromDom(editor.getBody());
      var range = shouldStore(editor) ? Option.from(rng) : Option.none();

      var newBookmark = range.map(nativeRangeToSelectionRange)
        .filter(isRngInRoot(root));

      editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
    };

    var getRng = function (editor) {
      var bookmark = editor.bookmark ? editor.bookmark : Option.none();

      return bookmark
        .bind(Fun.curry(validate, Element.fromDom(editor.getBody())))
        .bind(bookmarkToNativeRng);
    };

    var restore = function (editor) {
      getRng(editor).each(function (rng) {
        editor.selection.setRng(rng);
      });
    };

    return {
      store: store,
      storeNative: storeNative,
      readRange: readRange,
      restore: restore,
      getRng: getRng,
      getBookmark: getBookmark,
      validate: validate
    };
  }
);
