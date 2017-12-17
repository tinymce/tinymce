import { Pipeline } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewSanityTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  PreviewPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<strong>a</strong>'),
      tinyUi.sClickOnToolbar('click on preview toolbar', 'div[aria-label="Preview"] > button'),
      tinyUi.sWaitForPopup('wait for preview popup', 'div[role="dialog"][aria-label="Preview"] iframe')
    ], onSuccess, onFailure);
  }, {
    plugins: 'preview',
    toolbar: 'preview',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

