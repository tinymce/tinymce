asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'tinymce.core.selection.SelectionBookmark',
    'tinymce.core.test.ViewBlock'
  ],

  function (Assertions, Chain, Logger, Pipeline, RawAssertions, Fun, Hierarchy, Remove, Element, Traverse, Selection, WindowSelection, SelectionBookmark, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function (vb) {
        vb.update(html);
      });
    };

    var cSetSelection = function (startPath, soffset, finishPath, foffset) {
      return Chain.op(function () {
        var sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie('invalid startPath');
        var fc = Hierarchy.follow(Element.fromDom(viewBlock.get()), finishPath).getOrDie('invalid finishPath');
        var win = Traverse.defaultView(sc);

        WindowSelection.setExact(
          win.dom(), sc, soffset, fc, foffset
        );
      });
    };

    var cGetBookmark = function (rootPath) {
      return Chain.mapper(function () {
        var root = Hierarchy.follow(Element.fromDom(viewBlock.get()), rootPath).getOrDie();
        return SelectionBookmark.getBookmark(root);
      });
    };

    var cValidateBookmark = function (rootPath) {
      return Chain.on(function (input, next, die) {
        var root = Hierarchy.follow(Element.fromDom(viewBlock.get()), rootPath).getOrDie();

        return input.each(function (b) {
          return next(Chain.wrap(SelectionBookmark.validate(root, b)));
        });
      });
    };

    var cAssertNone = Chain.op(function (x) {
      RawAssertions.assertEq('should be none', true, x.isNone());
    });

    var cAssertSome = Chain.op(function (x) {
      RawAssertions.assertEq('should be some', true, x.isSome());
    });

    var cAssertSelection = function (startPath, startOffset, finishPath, finishOffset) {
      return Chain.op(function () {
        var sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
        var fc = Hierarchy.follow(Element.fromDom(viewBlock.get()), finishPath).getOrDie();

        var win = Traverse.defaultView(Element.fromDom(viewBlock.get()));

        var sel = WindowSelection.getExact(win.dom()).getOrDie('no selection');

        Assertions.assertDomEq('sc', sc, sel.start());
        Assertions.assertEq('soffset', startOffset, sel.soffset());
        Assertions.assertDomEq('fc', fc, sel.finish());
        Assertions.assertEq('foffset', finishOffset, sel.foffset());
      });
    };

    var cManipulateBookmarkOffsets = function (startPad, finishPad) {
      return Chain.mapper(function (bookmark) {
        return bookmark
          .map(function (bm) {
            return Selection.range(bm.start(), bm.soffset() + startPad, bm.finish(), bm.foffset() + finishPad);
          });
      });
    };

    var cDeleteElement = function (path) {
      return Chain.op(function () {
        Hierarchy.follow(Element.fromDom(viewBlock.get()), path).each(Remove.remove);
      });
    };

    var cAssertBookmark = function (startPath, startOffset, finishPath, finishOffset) {
      return Chain.op(function (input) {
        var sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
        var fc = Hierarchy.follow(Element.fromDom(viewBlock.get()), finishPath).getOrDie();

        var bookmarkRng = input.getOrDie('no bookmark!');

        Assertions.assertDomEq('sc', sc, bookmarkRng.start());
        Assertions.assertEq('soffset', startOffset, bookmarkRng.soffset());
        Assertions.assertDomEq('fc', fc, bookmarkRng.finish());
        Assertions.assertEq('foffset', finishOffset, bookmarkRng.foffset());
      });
    };

    var cSetSelectionFromBookmark = Chain.op(function (bookmark) {
      bookmark.each(function (b) {
        var root = Element.fromDom(viewBlock.get());
        var win = Traverse.defaultView(root);

        SelectionBookmark.validate(root, b)
          .each(function (rng) {
            WindowSelection.setExact(win.dom(), rng.start(), rng.soffset(), rng.finish(), rng.foffset());
          });
      });
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('attached element returns some', Chain.asStep(viewBlock, [
        cSetHtml('hello'),
        cSetSelection([0], 0, [0], 1),
        cGetBookmark([]),
        cAssertSome,
        cSetSelectionFromBookmark,
        cAssertSelection([0], 0, [0], 1)
      ])),
      Logger.t('foffset too big', Chain.asStep(viewBlock, [
        cSetHtml('hello'),
        cSetSelection([0], 0, [0], 3),
        cGetBookmark([]),
        cManipulateBookmarkOffsets(0, 10),
        cSetSelectionFromBookmark,
        cAssertSelection([0], 0, [0], 5)
      ])),
      Logger.t('soffset too small', Chain.asStep(viewBlock, [
        cSetHtml('hello'),
        cSetSelection([0], 0, [0], 3),
        cGetBookmark([]),
        cManipulateBookmarkOffsets(-2, 5),
        cSetSelectionFromBookmark,
        cAssertSelection([0], 0, [0], 5)
      ])),
      Logger.t('both offsets too small', Chain.asStep(viewBlock, [
        cSetHtml('hello'),
        cSetSelection([0], 0, [0], 3),
        cGetBookmark([]),
        cManipulateBookmarkOffsets(-2, -5),
        cSetSelectionFromBookmark,
        cAssertSelection([0], 0, [0], 0)
      ])),
      Logger.t('both offsets too small', Chain.asStep(viewBlock, [
        cSetHtml('hello'),
        cSetSelection([0], 0, [0], 3),
        cGetBookmark([]),
        cManipulateBookmarkOffsets(6, 6),
        cSetSelectionFromBookmark,
        cAssertSelection([0], 5, [0], 5)
      ])),
      Logger.t('two p tags offsets too big', Chain.asStep(viewBlock, [
        cSetHtml('<p>abc</p><p>123</p>'),
        cSetSelection([0, 0], 0, [1, 0], 1),
        cGetBookmark([]),
        cAssertSome,
        cManipulateBookmarkOffsets(4, 4),
        cSetSelectionFromBookmark,
        cAssertSelection([0, 0], 3, [1, 0], 3)
      ])),
      Logger.t('two p tags, delete one and should be none', Chain.asStep(viewBlock, [
        cSetHtml('<p>abc</p><p>123</p>'),
        cSetSelection([0, 0], 0, [1, 0], 1),
        cGetBookmark([]),
        cAssertSome,
        cDeleteElement([0]),
        cValidateBookmark([]),
        cAssertNone
      ])),
      Logger.t('three p tags, delete middle and should be none', Chain.asStep(viewBlock, [
        cSetHtml('<p>abc</p><p>xyz</p><p>123</p>'),
        cSetSelection([0, 0], 0, [2, 0], 1),
        cGetBookmark([]),
        cAssertSome,
        cDeleteElement([1]),
        cValidateBookmark([]),
        cSetSelectionFromBookmark,
        cAssertSelection([0, 0], 0, [1, 0], 1)
      ])),
      Logger.t('backwards selection should set a non-backwards bookmark, one p tag', Chain.asStep(viewBlock, [
        cSetHtml('<p>hello</p>'),
        cSetSelection([0, 0], 5, [0, 0], 0),
        cGetBookmark([]),
        cAssertSome,
        cValidateBookmark([]),
        cAssertBookmark([0, 0], 0, [0, 0], 5)
      ])),
      Logger.t('backwards selection should set a non-backwards bookmark, two p tags', Chain.asStep(viewBlock, [
        cSetHtml('<p>hello</p><p>world</p>'),
        cSetSelection([1, 0], 3, [0, 0], 2),
        cGetBookmark([]),
        cAssertSome,
        cValidateBookmark([]),
        cAssertBookmark([0, 0], 2, [1, 0], 3)
      ])),
      Logger.t('readRange with with win without getSelection should return Option.none', Chain.asStep({}, [
        Chain.mapper(function () {
          var mockWin = { getSelection: Fun.constant(null) };
          return SelectionBookmark.readRange(mockWin);
        }),
        cAssertNone
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);

  }
);
