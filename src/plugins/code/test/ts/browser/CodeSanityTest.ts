import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.code.CodeSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  CodePlugin();
  ModernTheme();

  const sAssertTextareaContent = function (expected) {
    return Step.sync(function () {
      const textarea: any = document.querySelector('div[role="dialog"] textarea');
      RawAssertions.assertEq('should have correct value', expected, textarea.value);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<b>a</b>'),
      tinyUi.sClickOnToolbar('click code button', 'div[aria-label="Source code"] button'),
      tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]'),
      sAssertTextareaContent('<p><strong>a</strong></p>')
    ], onSuccess, onFailure);
  }, {
    plugins: 'code',
    toolbar: 'code',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
