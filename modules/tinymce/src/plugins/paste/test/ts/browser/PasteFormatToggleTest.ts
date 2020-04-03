import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Paste from '../module/test/Paste';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteFormatToggleTest', (success, failure) => {
  Theme();
  PastePlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const steps = Env.webkit ?
      Log.steps('TBA', 'Paste: paste plain text',
        [
          tinyApis.sExecCommand('mceTogglePlainTextPaste'),
          Paste.sPaste(editor, { 'text/html': '<p><strong>test</strong></p>' }),
          tinyApis.sAssertContent('<p>test</p>'),
          tinyApis.sSetContent(''),
          tinyApis.sExecCommand('mceTogglePlainTextPaste'),
          Paste.sPaste(editor, { 'text/html': '<p><strong>test</strong></p>' }),
          tinyApis.sAssertContent('<p><strong>test</strong></p>')
        ]
      )
      : [];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'paste',
    toolbar: '',
    valid_styles: 'font-family,color',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
