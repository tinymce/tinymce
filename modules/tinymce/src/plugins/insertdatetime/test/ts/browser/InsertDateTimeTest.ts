import { Pipeline, Log, Step, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import InsertDatetimePlugin from 'tinymce/plugins/insertdatetime/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { SelectorFind, Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.insertdatetime.InsertDateTimeTest', (success, failure) => {

    InsertDatetimePlugin();
    SilverTheme();

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);

      const sFormatMatch = function () {
        return Step.sync(function () {

          const content = editor.getBody()
          const Timeelm = SelectorFind.descendant(Element.fromDom(content), "time").getOrDie();
          const regex = /^(\d+)(:{1})(\d+)(:{1})(\d+)$/g;
          const found = (Timeelm.dom() as any).textContent.match(regex);

          Assertions.assertEq("time didn't show in expted format", true, found.length === 1);
        });
      };

      Pipeline.async({},
        Log.steps('TBA', 'InsertDateTime: Click on Insertdatetime button and first item from the drop down menu will display. Assert date time is inserted', [
          tinyUi.sClickOnToolbar('click on insertdatetime button', '.tox-tbtn:not(tox-split-button__chevron)'),
          sFormatMatch(),

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