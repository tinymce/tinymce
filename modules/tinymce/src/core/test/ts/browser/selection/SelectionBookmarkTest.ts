import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Hierarchy, Remove, SimRange, SimSelection, SugarElement, Traverse, WindowSelection } from '@ephox/sugar';
import { assert } from 'chai';

import * as SelectionBookmark from 'tinymce/core/selection/SelectionBookmark';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.SelectionBookmarkTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const setSelection = (startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie('invalid startPath');
    const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie('invalid finishPath');
    const win = Traverse.defaultView(sc);

    WindowSelection.setExact(win.dom, sc, soffset, fc, foffset);
  };

  const getBookmark = (rootPath: number[]) => {
    const root = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), rootPath).getOrDie();
    return SelectionBookmark.getBookmark(root);
  };

  const validateBookmark = (bookmark: Optional<SimRange>, rootPath: number[]) => {
    const root = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), rootPath).getOrDie();
    return bookmark.bind((b) => SelectionBookmark.validate(root, b));
  };

  const assertNone = (x: Optional<unknown>) => {
    assert.isTrue(x.isNone(), 'should be none');
  };

  const assertSome = (x: Optional<unknown>) => {
    assert.isTrue(x.isSome(), 'should be some');
  };

  const assertSelection = (startPath: number[], startOffset: number, finishPath: number[], finishOffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie();

    const win = Traverse.defaultView(SugarElement.fromDom(viewBlock.get()));

    const sel = WindowSelection.getExact(win.dom).getOrDie('no selection');

    Assertions.assertDomEq('sc', sc, sel.start);
    assert.equal(sel.soffset, startOffset, 'soffset');
    Assertions.assertDomEq('fc', fc, sel.finish);
    assert.equal(sel.foffset, finishOffset, 'foffset');
  };

  const manipulateBookmarkOffsets = (bookmark: Optional<SimRange>, startPad: number, finishPad: number) => {
    return bookmark.map((bm) => {
      return SimSelection.range(bm.start, bm.soffset + startPad, bm.finish, bm.foffset + finishPad);
    });
  };

  const deleteElement = (path: number[]) => {
    Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).each(Remove.remove);
  };

  const assertBookmark = (bookmark: Optional<SimRange>, startPath: number[], startOffset: number, finishPath: number[], finishOffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const fc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), finishPath).getOrDie();

    const bookmarkRng = bookmark.getOrDie('no bookmark!');

    Assertions.assertDomEq('sc', sc, bookmarkRng.start);
    assert.equal(bookmarkRng.soffset, startOffset, 'soffset');
    Assertions.assertDomEq('fc', fc, bookmarkRng.finish);
    assert.equal(bookmarkRng.foffset, finishOffset, 'foffset');
  };

  const setSelectionFromBookmark = (bookmark: Optional<SimRange>) => {
    bookmark.each((b) => {
      const root = SugarElement.fromDom(viewBlock.get());
      const win = Traverse.defaultView(root);

      SelectionBookmark.validate(root, b)
        .each((rng) => {
          WindowSelection.setExact(win.dom, rng.start, rng.soffset, rng.finish, rng.foffset);
        });
    });
  };

  it('attached element returns some', () => {
    setHtml('hello');
    setSelection([ 0 ], 0, [ 0 ], 1);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    setSelectionFromBookmark(bookmark);
    assertSelection([ 0 ], 0, [ 0 ], 1);
  });

  it('foffset too big', () => {
    setHtml('hello');
    setSelection([ 0 ], 0, [ 0 ], 3);
    const bookmark = getBookmark([]);
    const newBookmark = manipulateBookmarkOffsets(bookmark, 0, 10);
    setSelectionFromBookmark(newBookmark);
    assertSelection([ 0 ], 0, [ 0 ], 5);
  });

  it('soffset too small', () => {
    setHtml('hello');
    setSelection([ 0 ], 0, [ 0 ], 3);
    const bookmark = getBookmark([]);
    const newBookmark = manipulateBookmarkOffsets(bookmark, -2, 5);
    setSelectionFromBookmark(newBookmark);
    assertSelection([ 0 ], 0, [ 0 ], 5);
  });

  it('both offsets too small', () => {
    setHtml('hello');
    setSelection([ 0 ], 0, [ 0 ], 3);
    const bookmark = getBookmark([]);
    const newBookmark = manipulateBookmarkOffsets(bookmark, -2, -5);
    setSelectionFromBookmark(newBookmark);
    assertSelection([ 0 ], 0, [ 0 ], 0);
  });

  it('both offsets too big', () => {
    setHtml('hello');
    setSelection([ 0 ], 0, [ 0 ], 3);
    const bookmark = getBookmark([]);
    const newBookmark = manipulateBookmarkOffsets(bookmark, 6, 6);
    setSelectionFromBookmark(newBookmark);
    assertSelection([ 0 ], 5, [ 0 ], 5);
  });

  it('two p tags offsets too big', () => {
    setHtml('<p>abc</p><p>123</p>');
    setSelection([ 0, 0 ], 0, [ 1, 0 ], 1);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    const newBookmark = manipulateBookmarkOffsets(bookmark, 4, 4);
    setSelectionFromBookmark(newBookmark);
    assertSelection([ 0, 0 ], 3, [ 1, 0 ], 3);
  });

  it('two p tags, delete one and should be none', () => {
    setHtml('<p>abc</p><p>123</p>');
    setSelection([ 0, 0 ], 0, [ 1, 0 ], 1);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    deleteElement([ 0 ]);
    const validBookmark = validateBookmark(bookmark, []);
    assertNone(validBookmark);
  });

  it('three p tags, delete middle and should be none', () => {
    setHtml('<p>abc</p><p>xyz</p><p>123</p>');
    setSelection([ 0, 0 ], 0, [ 2, 0 ], 1);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    deleteElement([ 1 ]);
    const validBookmark = validateBookmark(bookmark, []);
    setSelectionFromBookmark(validBookmark);
    assertSelection([ 0, 0 ], 0, [ 1, 0 ], 1);
  });

  it('backwards selection should set a non-backwards bookmark, one p tag', () => {
    setHtml('<p>hello</p>');
    setSelection([ 0, 0 ], 5, [ 0, 0 ], 0);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    const validBookmark = validateBookmark(bookmark, []);
    assertBookmark(validBookmark, [ 0, 0 ], 0, [ 0, 0 ], 5);
  });

  it('backwards selection should set a non-backwards bookmark, two p tags', () => {
    setHtml('<p>hello</p><p>world</p>');
    setSelection([ 1, 0 ], 3, [ 0, 0 ], 2);
    const bookmark = getBookmark([]);
    assertSome(bookmark);
    const validBookmark = validateBookmark(bookmark, []);
    assertBookmark(validBookmark, [ 0, 0 ], 2, [ 1, 0 ], 3);
  });

  it('readRange with with win without getSelection should return Optional.none', () => {
    const mockWin = { getSelection: Fun.constant(null) } as Window;
    const rngOpt = SelectionBookmark.readRange(mockWin);
    assertNone(rngOpt);
  });
});
