import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.code.CodeSanityTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  CodePlugin();
  ModernTheme();

  var sAssertTextareaContent = function (expected) {
    return Step.sync(function () {
      var textarea: any = document.querySelector('div[role="dialog"] textarea');
      RawAssertions.assertEq('should have correct value', expected, textarea.value);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyUi = TinyUi(editor);
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<b>a</b>'),
      tinyUi.sClickOnToolbar('click code button', 'div[aria-label="Source code"] button'),
      tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]'),
      sAssertTextareaContent('<p><strong>a</strong></p>')
    ], onSuccess, onFailure);
  }, {
    plugins: 'code',
    toolbar: 'code',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

