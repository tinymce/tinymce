import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import PrintPlugin from 'tinymce/plugins/print/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.print.PrintSanityTest', (success, failure) => {

  Theme();
  PrintPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [ Log.step('TBA', 'Print: Assert print button exists',
      tinyUi.sWaitForUi('check print button exists', 'button[aria-label="Print"]')
    )], onSuccess, onFailure);
  }, {
    plugins: 'print',
    toolbar: 'print',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
