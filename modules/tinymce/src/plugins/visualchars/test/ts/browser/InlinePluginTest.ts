import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.InlinePluginTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6282', 'Editor should not steal focus when loaded inline with visualchars', [
        tinyApis.sHasFocus(false), // NOTE: This is all we need to test.

        // The following is to assert the visualchars plugin exists and is initialised. This ensures we are testing the correct case.
        tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
        tinyApis.sAssertContentPresence({
          p: 1,
          span: 0
        }),
        tinyApis.sExecCommand('mceVisualChars'),
        tinyApis.sAssertContentPresence({
          p: 1,
          span: 2
        })
      ])
    ], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
