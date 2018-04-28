import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  PreviewPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<strong>a</strong>'),
      tinyUi.sClickOnToolbar('click on preview toolbar', 'div[aria-label="Preview"] > button'),
      tinyUi.sWaitForPopup('wait for preview popup', 'div[role="dialog"][aria-label="Preview"] iframe')
    ], onSuccess, onFailure);
  }, {
    plugins: 'preview',
    toolbar: 'preview',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
