import { Assertions, Logger, Pipeline, NamedChain, Chain, RawAssertions } from '@ephox/agar';
import { Editor, ApiChains } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import GetBookmark from 'tinymce/core/bookmark/GetBookmark';
import { Hierarchy, Element, Remove, Html, SelectorFilter, Replication } from '@ephox/sugar';
import { Result, Arr } from '@ephox/katamari';
import { isRangeBookmark, isPathBookmark, isIdBookmark, isIndexBookmark, isStringPathBookmark } from 'tinymce/core/bookmark/BookmarkTypes';
import ResolveBookmark from 'tinymce/core/bookmark/ResolveBookmark';

UnitTest.asynctest('browser.tinymce.core.bookmark.BookmarksTest', (success, failure) => {
  Theme();

  const cGetBookmark = (type: number, normalized: boolean) => {
    return NamedChain.direct('editor', Chain.mapper((editor) => GetBookmark.getBookmark(editor.selection, type, normalized)), 'bookmark');
  };

  const cGetFilledPersistentBookmark = (type: number, normalized: boolean) => {
    return NamedChain.direct('editor', Chain.mapper((editor) => GetBookmark.getPersistentBookmark(editor.selection, true)), 'bookmark');
  };

  const assertRawRange = function (element, rng, startPath, startOffset, endPath, endOffset) {
    const startContainer = Hierarchy.follow(element, startPath).getOrDie();
    const endContainer = Hierarchy.follow(element, endPath).getOrDie();

    Assertions.assertDomEq('Should be expected start container', startContainer, Element.fromDom(rng.startContainer));
    Assertions.assertEq('Should be expected start offset', startOffset, rng.startOffset);
    Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
    Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
  };

  const cBundleOp = (f) => {
    return NamedChain.bundle((input) => {
      f(input);
      return Result.value(input);
    });
  };

  const cCreateNamedEditor = NamedChain.write('editor', Editor.cFromSettings({
    base_url: '/project/tinymce/js/tinymce'
  }));

  const cSetupEditor = (content, startPath, startOffset, endPath, endOffset) => {
    return NamedChain.read('editor', Chain.fromChains([
      ApiChains.cSetContent(content),
      ApiChains.cSetSelection(startPath, startOffset, endPath, endOffset)
    ]));
  };

  const cRemoveEditor = NamedChain.read('editor', Editor.cRemove);

  const cSetCursor = (path, offset) => NamedChain.read('editor', ApiChains.cSetCursor(path, offset));

  const cResolveBookmark = cBundleOp((input) => {
    const rng = ResolveBookmark.resolve(input.editor.selection, input.bookmark).getOrDie('Should be resolved');
    input.editor.selection.setRng(rng);
  });

  const cAssertSelection = (spath, soffset, fpath, foffset) => NamedChain.read('editor', ApiChains.cAssertSelection(spath, soffset, fpath, foffset));

  const sBookmarkTest = (namedChains) => {
    return Chain.asStep({}, [
      NamedChain.asChain(Arr.flatten([
        [ cCreateNamedEditor ],
        namedChains,
        [ cRemoveEditor ]
      ])
    )]);
  };

  const cAssertRangeBookmark = (spath, soffset, fpath, foffset) => cBundleOp((input) => {
    RawAssertions.assertEq('Should be a range bookmark', true, isRangeBookmark(input.bookmark));
    assertRawRange(Element.fromDom(input.editor.getBody()), input.bookmark.rng, spath, soffset, fpath, foffset);
  });

  const cAssertPathBookmark = (expectedStart, expectedEnd) => cBundleOp((input) => {
    RawAssertions.assertEq('Should be a path bookmark', true, isPathBookmark(input.bookmark));
    RawAssertions.assertEq('Should be expected start path', expectedStart, input.bookmark.start);
    RawAssertions.assertEq('Should be expected end path', expectedEnd, input.bookmark.end);
  });

  const cAssertIndexBookmark = (expectedName, expectedIndex) => cBundleOp((input) => {
    RawAssertions.assertEq('Should be an index bookmark', true, isIndexBookmark(input.bookmark));
    RawAssertions.assertEq('Should be expected name', expectedName, input.bookmark.name);
    RawAssertions.assertEq('Should be expected index', expectedIndex, input.bookmark.index);
  });

  const cAssertStringPathBookmark = (expectedStart, expectedEnd) => cBundleOp((input) => {
    RawAssertions.assertEq('Should be a string bookmark', true, isStringPathBookmark(input.bookmark));
    RawAssertions.assertEq('Should be expected start', expectedStart, input.bookmark.start);
    RawAssertions.assertEq('Should be expected end', expectedEnd, input.bookmark.end);
  });

  const cAssertIdBookmark = cBundleOp((input) => {
    RawAssertions.assertEq('Should be an id bookmark', true, isIdBookmark(input.bookmark));
  });

  const cAssertApproxRawContent = (expectedHtml) => NamedChain.read('editor', Chain.op((editor) => {
    const elm = Replication.deep(Element.fromDom(editor.getBody()));
    Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus="all"]'), Remove.remove);
    const actualHtml = Html.get(elm);
    Assertions.assertHtmlStructure('Should expected structure', `<body>${expectedHtml}</body>`, `<body>${actualHtml}</body>`);
  }));

  Pipeline.async({}, [
    Logger.t('Range bookmark', sBookmarkTest([
      cSetupEditor('<p>a</p>', [0, 0], 0, [0, 0], 1),
      cGetBookmark(1, false),
      cAssertRangeBookmark([0, 0], 0, [0, 0], 1),
      cSetCursor([0, 0], 0),
      cResolveBookmark,
      cAssertSelection([0, 0], 0, [0, 0], 1)
    ])),
    Logger.t('Get path bookmark', sBookmarkTest([
      cSetupEditor('<p>a</p>', [0, 0], 0, [0, 0], 1),
      cGetBookmark(2, false),
      cAssertPathBookmark([0, 0, 0], [1, 0, 0]),
      cSetCursor([0, 0], 0),
      cResolveBookmark,
      cAssertSelection([0, 0], 0, [0, 0], 1)
    ])),
    Logger.t('Get id bookmark', sBookmarkTest([
      cSetupEditor('<p><img src="about:blank"></p>', [0], 0, [0], 1),
      cGetBookmark(2, false),
      cAssertIndexBookmark('IMG', 0),
      cSetCursor([0, 0], 0),
      cResolveBookmark,
      cAssertSelection([0], 0, [0], 1)
    ])),
    Logger.t('Get string path bookmark', sBookmarkTest([
      cSetupEditor('<p>a</p>', [0, 0], 0, [0, 0], 1),
      cGetBookmark(3, false),
      cAssertStringPathBookmark('p[0]/text()[0],0', 'p[0]/text()[0],1'),
      cSetCursor([0, 0], 0),
      cResolveBookmark,
      cAssertSelection([0, 0], 0, [0, 0], 1)
    ])),
    Logger.t('Get persistent bookmark on element indexes', sBookmarkTest([
      cSetupEditor('<p><img src="about:blank"></p>', [0], 0, [0], 1),
      cGetBookmark(0, false),
      cAssertApproxRawContent('<p><img src="about:blank"></p>'),
      cAssertIndexBookmark('IMG', 0),
      cSetCursor([0, 0], 0),
      cResolveBookmark,
      cAssertApproxRawContent('<p><img src="about:blank"></p>'),
      cAssertSelection([0], 0, [0], 1)
    ])),
    Logger.t('Get persistent bookmark marker spans on text offsets', sBookmarkTest([
      cSetupEditor('<p>abc</p>', [0, 0], 1, [0, 0], 2),
      cGetBookmark(0, false),
      cAssertApproxRawContent('<p>a<span data-mce-type="bookmark" id="mce_1_start"></span>b<span id="mce_1_end"></span>c</p>'),
      cAssertSelection([0, 2], 0, [0, 2], 1),
      cAssertIdBookmark,
      cSetCursor([0, 1], 0),
      cResolveBookmark,
      cAssertApproxRawContent('<p>abc</p>'),
      cAssertSelection([0, 0], 1, [0, 0], 2)
    ])),
    Logger.t('Get persistent bookmark marker spans on element indexes', sBookmarkTest([
      cSetupEditor('<p><input><input></p>', [0], 0, [0], 2),
      cGetBookmark(0, false),
      cAssertApproxRawContent('<p><span data-mce-type="bookmark" id="mce_1_start"></span><input><input><span id="mce_1_end"></span></p>'),
      cAssertSelection([0], 1, [0], 3),
      cAssertIdBookmark,
      cSetCursor([0], 2),
      cResolveBookmark,
      cAssertApproxRawContent('<p><input><input></p>'),
      cAssertSelection([0], 0, [0], 2)
    ])),
    Logger.t('Get persistent bookmark filled with marker spans on text offsets', sBookmarkTest([
      cSetupEditor('<p>abc</p>', [0, 0], 1, [0, 0], 2),
      cGetFilledPersistentBookmark(0, true),
      cAssertApproxRawContent('<p>a<span data-mce-type="bookmark" id="mce_1_start">\ufeff</span>b<span id="mce_1_end">\ufeff</span>c</p>'),
      cAssertSelection([0, 1, 0], 1, [0, 3, 0], 1),
      cAssertIdBookmark,
      cSetCursor([0, 1], 0),
      cResolveBookmark,
      cAssertApproxRawContent('<p>abc</p>'),
      cAssertSelection([0, 0], 1, [0, 0], 2)
    ])),
  ], success, failure);
});
