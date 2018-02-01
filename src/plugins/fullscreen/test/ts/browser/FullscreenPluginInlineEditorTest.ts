import { Pipeline, Step, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginInlineEditorTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  FullscreenPlugin();
  LinkPlugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Step.sync(() => {
        RawAssertions.assertEq('should have isFullsceen api function', false, editor.plugins.fullscreen.isFullscreen());
        RawAssertions.assertEq('should not have the fullscreen button', 'undefined', typeof editor.buttons.fullscreen);
      })
    ], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'fullscreen link',
    toolbar: 'fullscreen link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
