import { ApproxStructure, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import CodePlugin from 'tinymce/plugins/codesample/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.codesample.CodeSampleSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  CodePlugin();
  ModernTheme();

  const sInsertTextareaContent = function (value) {
    return Step.sync(function () {
      const textarea: any = document.querySelector('div[role="dialog"] textarea');
      textarea.value = value;
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click code button', 'div[aria-label="Insert/Edit code sample"] button'),
      tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]'),
      sInsertTextareaContent('<p>a</p>'),
      tinyUi.sClickOnUi('click OK btn', 'div.mce-primary button'),
      Waiter.sTryUntil('assert content',
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('pre', {
                attrs: {
                  contenteditable: str.is('false')
                }
              }),
              s.anything()
            ]
          });
        })), 100, 3000)
    ], onSuccess, onFailure);
  }, {
    plugins: 'codesample',
    toolbar: 'codesample',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
