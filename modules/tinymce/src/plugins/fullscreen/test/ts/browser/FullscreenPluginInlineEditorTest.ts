import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginInlineEditorTest', (success, failure) => {

  FullscreenPlugin();
  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [ Log.step('TBA', 'FullScreen: Assert isFullscreen api function is present and fullscreen button is absent',
      Step.sync(() => {
        Assert.eq('should have isFullsceen api function', false, editor.plugins.fullscreen.isFullscreen());
        Assert.eq('should not have the fullscreen button', 'undefined', typeof editor.ui.registry.getAll().buttons.fullscreen);
      })
    ) ], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'fullscreen link',
    toolbar: 'fullscreen link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
