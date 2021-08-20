import { Assertions } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, Remove, Replication, SelectorFilter, SugarElement } from '@ephox/sugar';
import { McEditor, TinyAssertions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import {
  Bookmark, IndexBookmark, isIdBookmark, isIndexBookmark, isPathBookmark, isRangeBookmark, isStringPathBookmark,
  PathBookmark, RangeBookmark, StringPathBookmark
} from 'tinymce/core/bookmark/BookmarkTypes';
import * as GetBookmark from 'tinymce/core/bookmark/GetBookmark';
import * as ResolveBookmark from 'tinymce/core/bookmark/ResolveBookmark';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.bookmark.BookmarksTest', () => {
  before(() => {
    Theme();
  });

  const bookmarkTest = (runTests: (editor: Editor) => void) => async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      menubar: false,
      toolbar: false,
      statusbar: false,
      base_url: '/project/tinymce/js/tinymce'
    });
    runTests(editor);
    McEditor.remove(editor);
  };

  const getBookmark = (editor: Editor, type: number, normalized: boolean) =>
    GetBookmark.getBookmark(editor.selection, type, normalized);

  const getFilledPersistentBookmark = (editor: Editor, _type: number, _normalized: boolean) =>
    GetBookmark.getPersistentBookmark(editor.selection, true);

  const assertRawRange = (element: SugarElement<Node>, rng: Range, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(element, startPath).getOrDie();
    const endContainer = Hierarchy.follow(element, endPath).getOrDie();

    Assertions.assertDomEq('Should be expected start container', startContainer, SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startOffset, startOffset, 'Should be expected start offset');
    Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
    assert.equal(rng.endOffset, endOffset, 'Should be expected end offset');
  };

  const setupEditor = (editor: Editor, content: string, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    editor.setContent(content);
    TinySelections.setSelection(editor, startPath, startOffset, endPath, endOffset);
  };

  const resolveBookmark = (editor: Editor, bookmark: Bookmark) => {
    const rng = ResolveBookmark.resolve(editor.selection, bookmark).getOrDie('Should be resolved');
    editor.selection.setRng(rng);
  };

  const assertRangeBookmark = (editor: Editor, bookmark: Bookmark, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    assert.isTrue(isRangeBookmark(bookmark), 'Should be a range bookmark');
    assertRawRange(TinyDom.body(editor), (bookmark as RangeBookmark).rng, spath, soffset, fpath, foffset);
  };

  const assertPathBookmark = (bookmark: Bookmark, expectedStart: number[], expectedEnd: number[]) => {
    assert.isTrue(isPathBookmark(bookmark), 'Should be a path bookmark');
    assert.deepEqual((bookmark as PathBookmark).start, expectedStart, 'Should be expected start path');
    assert.deepEqual((bookmark as PathBookmark).end, expectedEnd, 'Should be expected end path');
  };

  const assertIndexBookmark = (bookmark: Bookmark, expectedName: string, expectedIndex: number) => {
    assert.isTrue(isIndexBookmark(bookmark), 'Should be an index bookmark');
    assert.equal((bookmark as IndexBookmark).name, expectedName, 'Should be expected name');
    assert.equal((bookmark as IndexBookmark).index, expectedIndex, 'Should be expected index');
  };

  const assertStringPathBookmark = (bookmark: Bookmark, expectedStart: string, expectedEnd: string) => {
    assert.isTrue(isStringPathBookmark(bookmark), 'Should be a string bookmark');
    assert.equal((bookmark as StringPathBookmark).start, expectedStart, 'Should be expected start');
    assert.equal((bookmark as StringPathBookmark).end, expectedEnd, 'Should be expected end');
  };

  const assertIdBookmark = (bookmark: Bookmark) => {
    assert.isTrue(isIdBookmark(bookmark), 'Should be an id bookmark');
  };

  const assertApproxRawContent = (editor: Editor, expectedHtml: string) => {
    const elm = Replication.deep(TinyDom.body(editor));
    Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus="all"]'), Remove.remove);
    const actualHtml = Html.get(elm);
    Assertions.assertHtmlStructure('Should expected structure', `<body>${expectedHtml}</body>`, `<body>${actualHtml}</body>`);
  };

  it('Range bookmark', bookmarkTest((editor) => {
    setupEditor(editor, '<p>a</p>', [ 0, 0 ], 0, [ 0, 0 ], 1);
    const bookmark = getBookmark(editor, 1, false);
    assertRangeBookmark(editor, bookmark, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resolveBookmark(editor, bookmark);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  }));

  it('Get path bookmark', bookmarkTest((editor) => {
    setupEditor(editor, '<p>a</p>', [ 0, 0 ], 0, [ 0, 0 ], 1);
    const bookmark = getBookmark(editor, 2, false);
    assertPathBookmark(bookmark, [ 0, 0, 0 ], [ 1, 0, 0 ]);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resolveBookmark(editor, bookmark);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  }));

  it('Get id bookmark', bookmarkTest((editor) => {
    setupEditor(editor, '<p><img src="about:blank"></p>', [ 0 ], 0, [ 0 ], 1);
    const bookmark = getBookmark(editor, 2, false);
    assertIndexBookmark(bookmark, 'IMG', 0);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resolveBookmark(editor, bookmark);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  }));

  it('Get string path bookmark', bookmarkTest((editor) => {
    setupEditor(editor, '<p>a</p>', [ 0, 0 ], 0, [ 0, 0 ], 1);
    const bookmark = getBookmark(editor, 3, false);
    assertStringPathBookmark(bookmark, 'p[0]/text()[0],0', 'p[0]/text()[0],1');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resolveBookmark(editor, bookmark);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  }));

  it('Get persistent bookmark on element indexes', bookmarkTest((editor) => {
    setupEditor(editor, '<p><img src="about:blank"></p>', [ 0 ], 0, [ 0 ], 1);
    const bookmark = getBookmark(editor, 0, false);
    assertApproxRawContent(editor, '<p><img src="about:blank"></p>');
    assertIndexBookmark(bookmark, 'IMG', 0);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resolveBookmark(editor, bookmark);
    assertApproxRawContent(editor, '<p><img src="about:blank"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  }));

  it('Get persistent bookmark marker spans on text offsets', bookmarkTest((editor) => {
    setupEditor(editor, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 2);
    const bookmark = getBookmark(editor, 0, false);
    assertApproxRawContent(editor, '<p>a<span data-mce-type="bookmark" id="mce_1_start"></span>b<span id="mce_1_end"></span>c</p>');
    TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 1);
    assertIdBookmark(bookmark);
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    resolveBookmark(editor, bookmark);
    assertApproxRawContent(editor, '<p>abc</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
  }));

  it('Get persistent bookmark marker spans on element indexes', bookmarkTest((editor) => {
    setupEditor(editor, '<p><input><input></p>', [ 0 ], 0, [ 0 ], 2);
    const bookmark = getBookmark(editor, 0, false);
    assertApproxRawContent(editor, '<p><span data-mce-type="bookmark" id="mce_1_start"></span><input><input><span id="mce_1_end"></span></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 3);
    assertIdBookmark(bookmark);
    TinySelections.setCursor(editor, [ 0 ], 2);
    resolveBookmark(editor, bookmark);
    assertApproxRawContent(editor, '<p><input><input></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 2);
  }));

  it('Get persistent bookmark filled with marker spans on text offsets', bookmarkTest((editor) => {
    setupEditor(editor, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 2);
    const bookmark = getFilledPersistentBookmark(editor, 0, true);
    assertApproxRawContent(editor, '<p>a<span data-mce-type="bookmark" id="mce_1_start">\ufeff</span>b<span id="mce_1_end">\ufeff</span>c</p>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 3, 0 ], 1);
    assertIdBookmark(bookmark);
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    resolveBookmark(editor, bookmark);
    assertApproxRawContent(editor, '<p>abc</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
  }));
});
