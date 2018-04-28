import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Css, SelectorFind } from '@ephox/sugar';
import EditorView from 'tinymce/core/EditorView';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorViewIframeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const isPhantomJs = function () {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  const getIframeClientRect = function (editor) {
    return SelectorFind.descendant(Element.fromDom(editor.getContentAreaContainer()), 'iframe').map(function (elm) {
      return elm.dom().getBoundingClientRect();
    }).getOrDie();
  };

  const sSetBodyStyles = function (editor, css) {
    return Step.sync(function () {
      Css.setAll(Element.fromDom(editor.getBody()), css);
    });
  };

  const sTestIsXYInContentArea = function (editor) {
    return Step.sync(function () {
      const rect = getIframeClientRect(editor);

      Assertions.assertEq(
        'Should be inside the area since the scrollbars are excluded',
        true,
        EditorView.isXYInContentArea(editor, rect.width - 25, rect.height - 25)
      );

      Assertions.assertEq(
        'Should be outside the area since the cordinate is on the scrollbars',
        false,
        EditorView.isXYInContentArea(editor, rect.width - 5, rect.height - 5)
      );
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, isPhantomJs() ? [] : [
      Logger.t('isXYInContentArea without borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '0', margin: '0' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor)
      ])),

      Logger.t('isXYInContentArea with borders, margin', GeneralSteps.sequence([
        sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
        tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
        sTestIsXYInContentArea(editor)
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
