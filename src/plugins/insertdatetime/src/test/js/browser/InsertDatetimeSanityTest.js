import { ApproxStructure } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import InsertDatetimePlugin from 'tinymce/plugins/insertdatetime/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest(
  'browser.tinymce.plugins.insertdatetime.InsertDatetimeSanityTest',
  function() {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    InsertDatetimePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

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
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);

