import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Paste from '../module/test/Paste';

UnitTest.asynctest('Browser Test: .PasteStylesTest', (success, failure) => {

  Theme();
  PastePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const steps = Env.webkit ? [
      Log.stepsAsStep('TBA', 'Paste: Paste span with encoded style attribute, paste_webkit_styles: font-family',
        [
          tinyApis.sSetSetting('paste_webkit_styles', 'font-family'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;color:green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ]
      ),

      Log.stepsAsStep('TBA', 'Paste: Paste span with encoded style attribute, paste_webkit_styles: all',
        [
          tinyApis.sSetSetting('paste_webkit_styles', 'all'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;; color: green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\'; color: green;">b</span></p>')
        ]
      ),

      Log.stepsAsStep('TBA', 'Paste: Paste span with encoded style attribute, paste_webkit_styles: none',
        [
          tinyApis.sSetSetting('paste_webkit_styles', 'none'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p>b</p>')
        ]
      ),

      Log.stepsAsStep('TBA', 'Paste: Paste span with encoded style attribute, paste_remove_styles_if_webkit: false',
        [
          tinyApis.sSetSetting('paste_remove_styles_if_webkit', false),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ]
      )
    ] : [];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'paste',
    toolbar: '',
    valid_styles: 'font-family,color',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
