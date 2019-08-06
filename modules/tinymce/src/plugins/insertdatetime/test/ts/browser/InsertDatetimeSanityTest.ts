import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import InsertDatetimePlugin from 'tinymce/plugins/insertdatetime/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.insertdatetime.InsertDatetimeSanityTest', (success, failure) => {

    InsertDatetimePlugin();
    SilverTheme();

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      Pipeline.async({},
        Log.steps('TBA', 'InsertDateTime: Click on Insertdatetime button and select the first item from the drop down menu. Assert date time is inserted', [
          tinyUi.sClickOnToolbar('click on insertdatetime button', '[aria-haspopup="true"]'),
          tinyUi.sWaitForUi('wait for menu', '[role="menu"]'),
          tinyUi.sClickOnUi('click on first in menu', '[role="menu"] [role="menuitemcheckbox"]:first'),
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
        ])
      , onSuccess, onFailure);
    }, {
      plugins: 'insertdatetime',
      toolbar: 'insertdatetime',
      insertdatetime_element: true,
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
  }
);
