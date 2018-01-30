import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import Paste from '../module/test/Paste';

UnitTest.asynctest('Browser Test: .PasteStylesTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  PastePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const steps = Env.webkit ? [
      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: font-family',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'font-family'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;color:green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: all',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'all'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;; color: green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\'; color: green;">b</span></p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: none',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'none'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p>b</p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_remove_styles_if_webkit: false',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_remove_styles_if_webkit', false),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ])
      )
    ] : [];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'paste',
    toolbar: '',
    valid_styles: 'font-family,color',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
