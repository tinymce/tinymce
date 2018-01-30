import { Assertions, GeneralSteps, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import SelectionMatcher from 'tinymce/themes/inlite/core/SelectionMatcher';
import InliteTheme from 'tinymce/themes/inlite/Theme';

UnitTest.asynctest('browser.core.SelectionMatcherTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  InliteTheme();

  const assertResult = function (expectedResultState, result) {
    Assertions.assertEq('Should not be null', result !== null, expectedResultState);

    if (expectedResultState === true) {
      Assertions.assertEq('Should be matching a', result.id, 'a');
      Assertions.assertEq('Should be have width', result.rect.w > 0, true);
    }
  };

  const sTextSelectionTest = function (tinyApis, editor, inputHtml, spath, soffset, fpath, foffset, expectedResultState) {
    const sAssertTextSelectionResult = Step.sync(function () {
      const result = SelectionMatcher.textSelection('a')(editor);
      assertResult(expectedResultState, result);
    });

    return GeneralSteps.sequence([
      tinyApis.sSetContent(inputHtml),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sAssertTextSelectionResult
    ]);
  };

  const sTextSelectionTests = function (tinyApis, editor) {
    return GeneralSteps.sequence([
      sTextSelectionTest(tinyApis, editor, '<p>a<.p>', [0], 0, [0], 1, true),
      sTextSelectionTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 0, false)
    ]);
  };

  const sEmptyTextBlockTest = function (tinyApis, editor, inputHtml, spath, soffset, fpath, foffset, expectedResultState) {
    const sAssertTextSelectionResult = Step.sync(function () {
      const elements = editor.dom.getParents(editor.selection.getStart());
      const result = SelectionMatcher.emptyTextBlock(elements, 'a')(editor);
      assertResult(expectedResultState, result);
    });

    return GeneralSteps.sequence([
      tinyApis.sSetContent(inputHtml),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sAssertTextSelectionResult
    ]);
  };

  const sEmptyTextBlockTests = function (tinyApis, editor) {
    return GeneralSteps.sequence([
      sEmptyTextBlockTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 0, false),
      sEmptyTextBlockTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 1, false),
      sEmptyTextBlockTest(tinyApis, editor, '<p><br></p>', [0], 0, [0], 0, true),
      sEmptyTextBlockTest(tinyApis, editor, '<p><em><br></em></p>', [0, 0], 0, [0, 0], 0, true)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sTextSelectionTests(tinyApis, editor),
      sEmptyTextBlockTests(tinyApis, editor)
    ], onSuccess, onFailure);
  }, {
    inline: true,
    theme: 'inlite',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
