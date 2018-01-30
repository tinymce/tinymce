import { Pipeline, Step, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/fullscreen/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginInlineEditorTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Step.sync(() => {
        RawAssertions.assertEq(
          'should not have isFullscreen function',
          'undefined',
          typeof editor.plugins.fullscreen.isFullscreen);
      })
    ], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
