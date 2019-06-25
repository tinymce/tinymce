import { Pipeline, Step, RawAssertions, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginInlineEditorTest', (success, failure) => {

  FullscreenPlugin();
  LinkPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [ Log.step('TBA', 'FullScreen: Assert isFullscreen api function is present and fullscreen button is absent',
      Step.sync(() => {
        RawAssertions.assertEq('should have isFullsceen api function', false, editor.plugins.fullscreen.isFullscreen());
        RawAssertions.assertEq('should not have the fullscreen button', 'undefined', typeof editor.ui.registry.getAll().buttons.fullscreen);
      })
    )], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'fullscreen link',
    toolbar: 'fullscreen link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
