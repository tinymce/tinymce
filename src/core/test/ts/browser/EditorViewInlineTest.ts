import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Css } from '@ephox/sugar';
import EditorView from 'tinymce/core/EditorView';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorViewInlineTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sSetBodyStyles = function (editor, css) {
    return Step.sync(function () {
      Css.setAll(Element.fromDom(editor.getBody()), css);
    });
  };

  const sTestIsXYInContentArea = function (editor, deltaX, deltaY) {
    return Step.sync(function () {
      const rect = editor.getBody().getBoundingClientRect();

      Assertions.assertEq(
        'Should be inside the area since the scrollbars are excluded',
        true,
        EditorView.isXYInContentArea(editor, rect.right - 25 - deltaX, rect.bottom - 25 - deltaY)
      );

      Assertions.assertEq(
        'Should be outside the area since the cordinate is on the scrollbars',
        false,
        EditorView.isXYInContentArea(editor, rect.right - 5 - deltaX, rect.bottom - 5 - deltaY)
      );
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('isXYInContentArea without borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '0', margin: '0', width: '100px', height: '100px', overflow: 'scroll' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor, 0, 0)
      ])),

      Logger.t('isXYInContentArea with margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { margin: '15px' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor, -15, -15)
      ])),

      Logger.t('isXYInContentArea with borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor, -20, -20)
      ]))
    ], onSuccess, onFailure);
  }, {
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
