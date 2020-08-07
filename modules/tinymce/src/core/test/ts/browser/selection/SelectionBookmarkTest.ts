import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { Hierarchy, Remove, SimRange, SimSelection, SugarElement, Traverse, WindowSelection } from '@ephox/sugar';
import * as SelectionBookmark from 'tinymce/core/selection/SelectionBookmark';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.selection.SelectionBookmarkTest', function (success, failure) {

  const viewBlock = ViewBlock();

  const cSetHtml = function (html: string) {
    return Chain.op(function (vb: any) {
      vb.update(html);
    });
  };

  const cSetSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Chain.op(function () {
      const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie('invalid startPath');
      const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie('invalid finishPath');
      const win = Traverse.defaultView(sc);

      WindowSelection.setExact(
        win.dom, sc, soffset, fc, foffset
      );
    });
  };

  const cGetBookmark = function (rootPath: number[]) {
    return Chain.injectThunked(function () {
      const root = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), rootPath).getOrDie();
      return SelectionBookmark.getBookmark(root);
    });
  };

  const cValidateBookmark = function (rootPath: number[]) {
    return Chain.async(function (input: Optional<SimRange>, next) {
      const root = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), rootPath).getOrDie();

      return input.each(function (b) {
        return next(SelectionBookmark.validate(root, b));
      });
    });
  };

  const cAssertNone = <T> () => Chain.op(function (x: Optional<T>) {
    KAssert.eqNone('should be none', x);
  });

  const cAssertSome = Chain.op(function (x: Optional<any>) {
    Assert.eq('should be some', true, x.isSome());
  });

  const cAssertSelection = function (startPath: number[], startOffset: number, finishPath: number[], finishOffset: number) {
    return Chain.op(function () {
      const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
      const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie();

      const win = Traverse.defaultView(SugarElement.fromDom(viewBlock.get()));

      const sel = WindowSelection.getExact(win.dom).getOrDie('no selection');

      Assertions.assertDomEq('sc', sc, sel.start);
      Assertions.assertEq('soffset', startOffset, sel.soffset);
      Assertions.assertDomEq('fc', fc, sel.finish);
      Assertions.assertEq('foffset', finishOffset, sel.foffset);
    });
  };

  const cManipulateBookmarkOffsets = function (startPad: number, finishPad: number) {
    return Chain.mapper(function (bookmark: Optional<SimRange>) {
      return bookmark
        .map(function (bm) {
          return SimSelection.range(bm.start, bm.soffset + startPad, bm.finish, bm.foffset + finishPad);
        });
    });
  };

  const cDeleteElement = function (path: number[]) {
    return Chain.op(function () {
      Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).each(Remove.remove);
    });
  };

  const cAssertBookmark = function (startPath: number[], startOffset: number, finishPath: number[], finishOffset: number) {
    return Chain.op(function (input: Optional<SimRange>) {
      const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
      const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie();

      const bookmarkRng = input.getOrDie('no bookmark!');

      Assertions.assertDomEq('sc', sc, bookmarkRng.start);
      Assertions.assertEq('soffset', startOffset, bookmarkRng.soffset);
      Assertions.assertDomEq('fc', fc, bookmarkRng.finish);
      Assertions.assertEq('foffset', finishOffset, bookmarkRng.foffset);
    });
  };

  const cSetSelectionFromBookmark = Chain.op(function (bookmark: Optional<SimRange>) {
    bookmark.each(function (b) {
      const root = SugarElement.fromDom(viewBlock.get());
      const win = Traverse.defaultView(root);

      SelectionBookmark.validate(root, b)
        .each(function (rng) {
          WindowSelection.setExact(win.dom, rng.start, rng.soffset, rng.finish, rng.foffset);
        });
    });
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('attached element returns some', Chain.asStep(viewBlock, [
      cSetHtml('hello'),
      cSetSelection([ 0 ], 0, [ 0 ], 1),
      cGetBookmark([]),
      cAssertSome,
      cSetSelectionFromBookmark,
      cAssertSelection([ 0 ], 0, [ 0 ], 1)
    ])),
    Logger.t('foffset too big', Chain.asStep(viewBlock, [
      cSetHtml('hello'),
      cSetSelection([ 0 ], 0, [ 0 ], 3),
      cGetBookmark([]),
      cManipulateBookmarkOffsets(0, 10),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0 ], 0, [ 0 ], 5)
    ])),
    Logger.t('soffset too small', Chain.asStep(viewBlock, [
      cSetHtml('hello'),
      cSetSelection([ 0 ], 0, [ 0 ], 3),
      cGetBookmark([]),
      cManipulateBookmarkOffsets(-2, 5),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0 ], 0, [ 0 ], 5)
    ])),
    Logger.t('both offsets too small', Chain.asStep(viewBlock, [
      cSetHtml('hello'),
      cSetSelection([ 0 ], 0, [ 0 ], 3),
      cGetBookmark([]),
      cManipulateBookmarkOffsets(-2, -5),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0 ], 0, [ 0 ], 0)
    ])),
    Logger.t('both offsets too small', Chain.asStep(viewBlock, [
      cSetHtml('hello'),
      cSetSelection([ 0 ], 0, [ 0 ], 3),
      cGetBookmark([]),
      cManipulateBookmarkOffsets(6, 6),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0 ], 5, [ 0 ], 5)
    ])),
    Logger.t('two p tags offsets too big', Chain.asStep(viewBlock, [
      cSetHtml('<p>abc</p><p>123</p>'),
      cSetSelection([ 0, 0 ], 0, [ 1, 0 ], 1),
      cGetBookmark([]),
      cAssertSome,
      cManipulateBookmarkOffsets(4, 4),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0, 0 ], 3, [ 1, 0 ], 3)
    ])),
    Logger.t('two p tags, delete one and should be none', Chain.asStep(viewBlock, [
      cSetHtml('<p>abc</p><p>123</p>'),
      cSetSelection([ 0, 0 ], 0, [ 1, 0 ], 1),
      cGetBookmark([]),
      cAssertSome,
      cDeleteElement([ 0 ]),
      cValidateBookmark([]),
      cAssertNone()
    ])),
    Logger.t('three p tags, delete middle and should be none', Chain.asStep(viewBlock, [
      cSetHtml('<p>abc</p><p>xyz</p><p>123</p>'),
      cSetSelection([ 0, 0 ], 0, [ 2, 0 ], 1),
      cGetBookmark([]),
      cAssertSome,
      cDeleteElement([ 1 ]),
      cValidateBookmark([]),
      cSetSelectionFromBookmark,
      cAssertSelection([ 0, 0 ], 0, [ 1, 0 ], 1)
    ])),
    Logger.t('backwards selection should set a non-backwards bookmark, one p tag', Chain.asStep(viewBlock, [
      cSetHtml('<p>hello</p>'),
      cSetSelection([ 0, 0 ], 5, [ 0, 0 ], 0),
      cGetBookmark([]),
      cAssertSome,
      cValidateBookmark([]),
      cAssertBookmark([ 0, 0 ], 0, [ 0, 0 ], 5)
    ])),
    Logger.t('backwards selection should set a non-backwards bookmark, two p tags', Chain.asStep(viewBlock, [
      cSetHtml('<p>hello</p><p>world</p>'),
      cSetSelection([ 1, 0 ], 3, [ 0, 0 ], 2),
      cGetBookmark([]),
      cAssertSome,
      cValidateBookmark([]),
      cAssertBookmark([ 0, 0 ], 2, [ 1, 0 ], 3)
    ])),
    Logger.t('readRange with with win without getSelection should return Optional.none', Chain.asStep({}, [
      Chain.injectThunked(function () {
        const mockWin = { getSelection: Fun.constant(null) } as Window;
        return SelectionBookmark.readRange(mockWin);
      }),
      cAssertNone()
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
