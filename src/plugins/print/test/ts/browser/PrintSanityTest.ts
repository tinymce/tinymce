import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import PrintPlugin from 'tinymce/plugins/print/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.print.PrintSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  PrintPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sWaitForUi('check print button exists', 'div[aria-label="Print"] > button')
    ], onSuccess, onFailure);
  }, {
    plugins: 'print',
    toolbar: 'print',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
