import { ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import InsertDatetimePlugin from 'tinymce/plugins/insertdatetime/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.insertdatetime.InsertDatetimeSanityTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    InsertDatetimePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyUi.sClickOnToolbar('click on insertdatetime button', 'div[aria-label="Insert date/time"] > button.mce-open'),
        tinyUi.sClickOnUi('click on first in menu', 'div[role="menu"] > div.mce-first > span'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('time', {})
                ]
              })
            ]
          });
        }))
      ], onSuccess, onFailure);
    }, {
      plugins: 'insertdatetime',
      toolbar: 'insertdatetime',
      insertdatetime_element: true,
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);
