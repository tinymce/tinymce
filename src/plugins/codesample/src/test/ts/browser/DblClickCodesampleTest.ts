import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import CodePlugin from 'tinymce/plugins/codesample/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.codesample.DblClickCodesampleTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  CodePlugin();
  ModernTheme();

  var sInsertTextareaContent = function (value) {
    return Step.sync(function () {
      var textarea: any = document.querySelector('div[role="dialog"] textarea');
      textarea.value = value;
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('doubleclick on codesample opens dialog', GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('click code button', 'div[aria-label="Insert/Edit code sample"] button'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]'),
        sInsertTextareaContent('<p>a</p>'),
        tinyUi.sClickOnUi('click OK btn', 'div.mce-primary button'),
        Step.sync(function () {
          var pre = editor.getBody().querySelector('pre');
          editor.fire('dblclick', { target: pre });
        }),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'codesample',
    toolbar: 'codesample',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

